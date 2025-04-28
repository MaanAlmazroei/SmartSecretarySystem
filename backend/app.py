from flask import Flask, request, jsonify, session
from firebase_admin import firestore, auth
from firebase_config import db
import functools
from flask_cors import CORS
import secrets
from datetime import timedelta

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)  # Generate a secure secret key
app.config['SESSION_TYPE'] = 'filesystem'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)
app.config['SESSION_COOKIE_SECURE'] = False  # Set to False for development
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# Configure CORS with proper settings
CORS(app, 
     resources={
         r"/*": {
             "origins": ["http://localhost:3000"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "supports_credentials": True,
             "expose_headers": ["Set-Cookie"]
         }
     })

db = firestore.client()

# Authentication and Authorization Helpers
def verify_id_token(id_token):
    """Verify Firebase ID token and return decoded token or None."""
    try:
        if not id_token or not id_token.startswith('Bearer '):
            return None
        token = id_token.split('Bearer ')[1]
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        return None

def require_auth(f):
    """Decorator to require authentication for endpoints."""
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('user_id'):
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

def require_secretary_role(f):
    """Decorator to require secretary role for endpoints."""
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('user_id'):
            return jsonify({'error': 'Authentication required'}), 401
        if session.get('role') != 'secretary':
            return jsonify({'error': 'Secretary permission required'}), 403
        return f(*args, **kwargs)
    return decorated_function

# ===== USERS CRUD =====

@app.route('/create_user', methods=['POST'])
def create_user():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['email', 'password', 'firstName', 'lastName', 'phone']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    try:
        # Create user in Firebase Auth
        user_record = auth.create_user(
            email=data['email'],
            password=data['password']
        )

        # Store user data in Firestore
        user_data = {
            'firstName': data['firstName'],
            'lastName': data['lastName'],
            'phone': data['phone'],
            'role': 'user',
            'createdAt': firestore.SERVER_TIMESTAMP,
            'lastUpdatedDate': firestore.SERVER_TIMESTAMP,
        }
        
        db.collection('users').document(user_record.uid).set(user_data)
        
        # Create session for the user
        session['user_id'] = user_record.uid
        session['email'] = data['email']
        session['role'] = 'user'
        
        return jsonify({
            "message": "User created successfully",
            "userId": user_record.uid,
            "email": data['email'],
            "role": "user"
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
        
    data = request.get_json()
    
    if 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password are required'}), 400
    
    try:
        # Verify user credentials with Firebase
        user = auth.get_user_by_email(data['email'])
        
        # Set session data
        session.permanent = True
        session['user_id'] = user.uid
        session['email'] = data['email']
        
        # Get user role from Firestore
        user_doc = db.collection('users').document(user.uid).get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            session['role'] = user_data.get('role', 'user')
        
        return jsonify({
            "message": "Login successful",
            "userId": user.uid,
            "email": data['email'],
            "role": session['role']
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 401

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"})

@app.route('/check_auth', methods=['GET', 'OPTIONS'])
def check_auth():
    if request.method == 'OPTIONS':
        return '', 200
        
    if 'user_id' in session:
        return jsonify({
            "isAuthenticated": True,
            "userId": session['user_id'],
            "email": session['email'],
            "role": session['role']
        })
    return jsonify({"isAuthenticated": False}), 401

@app.route('/get_user', methods=['GET'])
@require_auth
def get_user():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({'error': 'userId is required'}), 400
    
    # Users can only get their own data unless they're a secretary
    current_user_id = session.get('user_id')
    user_doc = db.collection('users').document(current_user_id).get()
    user_role = user_doc.to_dict().get('role') if user_doc.exists else 'user'
    
    if user_id != current_user_id and user_role != 'secretary':
        return jsonify({'error': 'Unauthorized to access this user data'}), 403
    
    user_doc = db.collection('users').document(user_id).get()
    if user_doc.exists:
        return jsonify(user_doc.to_dict())
    return jsonify({'error': 'User not found'}), 404


@app.route('/get_all_users', methods=['GET'])
@require_secretary_role
def get_all_users():
    users = db.collection('users').stream()
    result = []
    for user in users:
        user_data = user.to_dict()
        user_data['id'] = user.id
        result.append(user_data)
    return jsonify(result)


@app.route('/update_user', methods=['PUT'])
@require_auth
def update_user():
    data = request.get_json()
    
    if 'userId' not in data:
        return jsonify({'error': 'userId is required'}), 400
    
    user_id = data['userId']
    current_user_id = session.get('user_id')
    
    # Only allow users to update their own data unless they're a secretary
    user_doc = db.collection('users').document(current_user_id).get()
    user_role = user_doc.to_dict().get('role') if user_doc.exists else 'user'
    
    if user_id != current_user_id and user_role != 'secretary':
        return jsonify({'error': 'Unauthorized to update this user'}), 403
    
    # Validate and filter allowed fields
    allowed_fields = ['firstName', 'lastName', 'phone']
    updated_data = {}
    for field in allowed_fields:
        if field in data:
            updated_data[field] = data[field]
    
    if not updated_data:
        return jsonify({'error': 'No valid fields to update'}), 400
    
    # Add lastUpdatedDate to fields being updated
    updated_data['lastUpdatedDate'] = firestore.SERVER_TIMESTAMP
    
    db.collection('users').document(user_id).update(updated_data)
    return jsonify({"message": "User updated successfully"})


@app.route('/delete_user', methods=['DELETE'])
@require_secretary_role
def delete_user():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({'error': 'userId is required'}), 400
    
    try:
        # Delete user from Firebase Auth
        auth.delete_user(user_id)
        # Delete user data from Firestore
        db.collection('users').document(user_id).delete()
        return jsonify({"message": "User deleted successfully"})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ===== TICKETS CRUD =====

@app.route('/create_ticket', methods=['POST'])
@require_auth
def create_ticket():
    data = request.get_json()
    
    # Validate required fields
    if 'title' not in data or 'description' not in data:
        return jsonify({'error': 'Both title and description are required'}), 400
    
    # Extract validated ticket data fields
    ticket_data = {
        'title': data['title'],
        'description': data['description'],
        'status': 'In Progress',  # Default status for tickets
        'feedback': '',  # Default empty feedback
        'userId': session.get('user_id'),
        'createdAt': firestore.SERVER_TIMESTAMP,
        'lastUpdatedDate': firestore.SERVER_TIMESTAMP,
    }
    
    # Add ticket to Firestore with auto-generated ID
    ticket_ref = db.collection('tickets').add(ticket_data)
    
    return jsonify({'ticketId': ticket_ref[1].id})


@app.route('/get_ticket', methods=['GET'])
@require_auth
def get_ticket():
    ticket_id = request.args.get('ticketId')
    if not ticket_id:
        return jsonify({'error': 'ticketId is required'}), 400
    
    ticket_doc = db.collection('tickets').document(ticket_id).get()
    if not ticket_doc.exists:
        return jsonify({'error': 'Ticket not found'}), 404
    
    ticket_data = ticket_doc.to_dict()
    current_user_id = session.get('user_id')
    
    # Check if the user is the owner of the ticket or a secretary
    user_doc = db.collection('users').document(current_user_id).get()
    user_role = user_doc.to_dict().get('role') if user_doc.exists else 'user'
    
    if ticket_data['userId'] != current_user_id and user_role != 'secretary':
        return jsonify({'error': 'Unauthorized to access this ticket'}), 403
    
    return jsonify(ticket_data)


@app.route('/get_all_tickets', methods=['GET'])
@require_secretary_role
def get_all_tickets():
    tickets = db.collection('tickets').stream()
    result = []
    for ticket in tickets:
        ticket_data = ticket.to_dict()
        ticket_data['id'] = ticket.id
        result.append(ticket_data)
    return jsonify(result)


@app.route('/get_user_tickets', methods=['GET'])
@require_auth
def get_user_tickets():
    user_id = request.args.get('userId')
    if not user_id:
        user_id = session.get('user_id')
    
    # If trying to access another user's tickets, check if secretary
    current_user_id = session.get('user_id')
    if user_id != current_user_id:
        user_doc = db.collection('users').document(current_user_id).get()
        user_role = user_doc.to_dict().get('role') if user_doc.exists else 'user'
        if user_role != 'secretary':
            return jsonify({'error': 'Unauthorized to access tickets of other users'}), 403
    
    tickets = db.collection('tickets').where('userId', '==', user_id).stream()
    result = []
    for ticket in tickets:
        ticket_data = ticket.to_dict()
        ticket_data['id'] = ticket.id
        result.append(ticket_data)
    return jsonify(result)


@app.route('/update_ticket', methods=['PUT'])
@require_secretary_role
def update_ticket():
    data = request.get_json()
    
    if 'ticketId' not in data:
        return jsonify({'error': 'ticketId is required'}), 400
    
    ticket_id = data['ticketId']
    
    # Check if the ticket exists
    ticket_doc = db.collection('tickets').document(ticket_id).get()
    if not ticket_doc.exists:
        return jsonify({'error': 'Ticket not found'}), 404
    
    # Validate status if it's being updated
    if 'status' in data:
        valid_statuses = ['In Progress', 'Resolved']
        if data['status'] not in valid_statuses:
            return jsonify({'error': f'Invalid status. Status must be one of: {", ".join(valid_statuses)}'}), 400
    
    # Validate and filter allowed fields
    allowed_fields = ['title', 'description', 'status', 'feedback']
    updated_data = {}
    for field in allowed_fields:
        if field in data:
            updated_data[field] = data[field]
    
    if not updated_data:
        return jsonify({'error': 'No valid fields to update'}), 400
    
    # Add lastUpdatedDate to fields being updated
    updated_data['lastUpdatedDate'] = firestore.SERVER_TIMESTAMP
    
    db.collection('tickets').document(ticket_id).update(updated_data)
    return jsonify({"message": "Ticket updated successfully"})


@app.route('/delete_ticket', methods=['DELETE'])
@require_auth
def delete_ticket():
    ticket_id = request.args.get('ticketId')
    if not ticket_id:
        return jsonify({'error': 'ticketId is required'}), 400
    
    # Check if the ticket exists
    ticket_doc = db.collection('tickets').document(ticket_id).get()
    if not ticket_doc.exists:
        return jsonify({'error': 'Ticket not found'}), 404
    
    ticket_data = ticket_doc.to_dict()
    current_user_id = session.get('user_id')
    
    # Check if the user is the owner of the ticket or a secretary
    user_doc = db.collection('users').document(current_user_id).get()
    user_role = user_doc.to_dict().get('role') if user_doc.exists else 'user'
    
    if ticket_data['userId'] != current_user_id and user_role != 'secretary':
        return jsonify({'error': 'Unauthorized to delete this ticket'}), 403
    
    db.collection('tickets').document(ticket_id).delete()
    return jsonify({"message": "Ticket deleted successfully"})


# ===== APPOINTMENTS CRUD =====

@app.route('/create_appointment', methods=['POST'])
@require_auth
def create_appointment():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['title', 'description', 'appointmentDate', 'appointmentTime']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Extract validated appointment data fields
    appointment_data = {
        'title': data['title'],
        'description': data['description'],
        'appointmentDate': data['appointmentDate'],
        'appointmentTime': data['appointmentTime'],
        'status': 'In Progress',  # Default status for appointments
        'feedback': '',  # Default empty feedback
        'userId': session.get('user_id'),
        'createdAt': firestore.SERVER_TIMESTAMP,
        'lastUpdatedDate': firestore.SERVER_TIMESTAMP,
    }
    
    # Add appointment to Firestore with auto-generated ID
    appointment_ref = db.collection('appointments').add(appointment_data)
    
    return jsonify({'appointmentId': appointment_ref[1].id})


@app.route('/get_appointment', methods=['GET'])
@require_auth
def get_appointment():
    appointment_id = request.args.get('appointmentId')
    if not appointment_id:
        return jsonify({'error': 'appointmentId is required'}), 400
    
    appointment_doc = db.collection('appointments').document(appointment_id).get()
    if not appointment_doc.exists:
        return jsonify({'error': 'Appointment not found'}), 404
    
    appointment_data = appointment_doc.to_dict()
    current_user_id = session.get('user_id')
    
    # Check if the user is the owner of the appointment or a secretary
    user_doc = db.collection('users').document(current_user_id).get()
    user_role = user_doc.to_dict().get('role') if user_doc.exists else 'user'
    
    if appointment_data['userId'] != current_user_id and user_role != 'secretary':
        return jsonify({'error': 'Unauthorized to access this appointment'}), 403
    
    return jsonify(appointment_data)


@app.route('/get_all_appointments', methods=['GET'])
@require_secretary_role
def get_all_appointments():
    appointments = db.collection('appointments').stream()
    result = []
    for appointment in appointments:
        appointment_data = appointment.to_dict()
        appointment_data['id'] = appointment.id
        result.append(appointment_data)
    return jsonify(result)


@app.route('/get_user_appointments', methods=['GET'])
@require_auth
def get_user_appointments():
    user_id = request.args.get('userId')
    if not user_id:
        user_id = session.get('user_id')
    
    # If trying to access another user's appointments, check if secretary
    current_user_id = session.get('user_id')
    if user_id != current_user_id:
        user_doc = db.collection('users').document(current_user_id).get()
        user_role = user_doc.to_dict().get('role') if user_doc.exists else 'user'
        if user_role != 'secretary':
            return jsonify({'error': 'Unauthorized to access appointments of other users'}), 403
    
    appointments = db.collection('appointments').where('userId', '==', user_id).stream()
    result = []
    for appointment in appointments:
        appointment_data = appointment.to_dict()
        appointment_data['id'] = appointment.id
        result.append(appointment_data)
    return jsonify(result)


@app.route('/update_appointment', methods=['PUT'])
@require_secretary_role
def update_appointment():
    data = request.get_json()
    
    if 'appointmentId' not in data:
        return jsonify({'error': 'appointmentId is required'}), 400
    
    appointment_id = data['appointmentId']
    
    # Check if the appointment exists
    appointment_doc = db.collection('appointments').document(appointment_id).get()
    if not appointment_doc.exists:
        return jsonify({'error': 'Appointment not found'}), 404
    
    # Validate status if it's being updated
    if 'status' in data:
        valid_statuses = ['In Progress', 'Approved', 'Rejected']
        if data['status'] not in valid_statuses:
            return jsonify({'error': f'Invalid status. Status must be one of: {", ".join(valid_statuses)}'}), 400
    
    # Validate and filter allowed fields
    allowed_fields = ['title', 'description', 'appointmentDate', 'appointmentTime', 'status', 'feedback']
    updated_data = {}
    for field in allowed_fields:
        if field in data:
            updated_data[field] = data[field]
    
    if not updated_data:
        return jsonify({'error': 'No valid fields to update'}), 400
    
    # Add lastUpdatedDate to fields being updated
    updated_data['lastUpdatedDate'] = firestore.SERVER_TIMESTAMP
    
    db.collection('appointments').document(appointment_id).update(updated_data)
    return jsonify({"message": "Appointment updated successfully"})


@app.route('/delete_appointment', methods=['DELETE'])
@require_auth
def delete_appointment():
    appointment_id = request.args.get('appointmentId')
    if not appointment_id:
        return jsonify({'error': 'appointmentId is required'}), 400
    
    # Check if the appointment exists
    appointment_doc = db.collection('appointments').document(appointment_id).get()
    if not appointment_doc.exists:
        return jsonify({'error': 'Appointment not found'}), 404
    
    appointment_data = appointment_doc.to_dict()
    current_user_id = session.get('user_id')
    
    # Check if the user is the owner of the appointment or a secretary
    user_doc = db.collection('users').document(current_user_id).get()
    user_role = user_doc.to_dict().get('role') if user_doc.exists else 'user'
    
    if appointment_data['userId'] != current_user_id and user_role != 'secretary':
        return jsonify({'error': 'Unauthorized to delete this appointment'}), 403
    
    db.collection('appointments').document(appointment_id).delete()
    return jsonify({"message": "Appointment deleted successfully"})


# ===== RESOURCES CRUD =====

@app.route('/create_resource', methods=['POST'])
@require_secretary_role
def create_resource():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['title', 'description', 'type']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Extract validated resource data fields
    resource_data = {
        'title': data['title'],
        'description': data['description'],
        'type': data['type'],
        'createdAt': firestore.SERVER_TIMESTAMP,
        'lastUpdatedDate': firestore.SERVER_TIMESTAMP,
    }
    
    # Add resource to Firestore with auto-generated ID
    resource_ref = db.collection('resources').add(resource_data)
    
    return jsonify({'resourceId': resource_ref[1].id})


@app.route('/get_resource', methods=['GET'])
def get_resource():
    resource_id = request.args.get('resourceId')
    if not resource_id:
        return jsonify({'error': 'resourceId is required'}), 400
    
    resource_doc = db.collection('resources').document(resource_id).get()
    if resource_doc.exists:
        return jsonify(resource_doc.to_dict())
    return jsonify({'error': 'Resource not found'}), 404


@app.route('/get_all_resources', methods=['GET'])
def get_all_resources():
    resources = db.collection('resources').stream()
    result = []
    for resource in resources:
        resource_data = resource.to_dict()
        resource_data['id'] = resource.id
        result.append(resource_data)
    return jsonify(result)


@app.route('/update_resource', methods=['PUT'])
@require_secretary_role
def update_resource():
    data = request.get_json()
    
    if 'resourceId' not in data:
        return jsonify({'error': 'resourceId is required'}), 400
    
    resource_id = data['resourceId']
    
    # Check if the resource exists
    resource_doc = db.collection('resources').document(resource_id).get()
    if not resource_doc.exists:
        return jsonify({'error': 'Resource not found'}), 404
    
    # Validate and filter allowed fields
    allowed_fields = ['title', 'description', 'type']
    updated_data = {}
    for field in allowed_fields:
        if field in data:
            updated_data[field] = data[field]
    
    if not updated_data:
        return jsonify({'error': 'No valid fields to update'}), 400
    
    # Add lastUpdatedDate to fields being updated
    updated_data['lastUpdatedDate'] = firestore.SERVER_TIMESTAMP
    
    db.collection('resources').document(resource_id).update(updated_data)
    return jsonify({"message": "Resource updated successfully"})


@app.route('/delete_resource', methods=['DELETE'])
@require_secretary_role
def delete_resource():
    resource_id = request.args.get('resourceId')
    if not resource_id:
        return jsonify({'error': 'resourceId is required'}), 400
    
    # Check if the resource exists
    resource_doc = db.collection('resources').document(resource_id).get()
    if not resource_doc.exists:
        return jsonify({'error': 'Resource not found'}), 404
    
    db.collection('resources').document(resource_id).delete()
    return jsonify({"message": "Resource deleted successfully"})


# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True, port=5000)