import os
from flask import Flask, request, jsonify, session
from firebase_admin import firestore, auth
import requests
from firebase_config import db
from supabase_config import storage
import functools
from flask_cors import CORS
import secrets
from datetime import timedelta, datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

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

# Firebase API Helpers
def get_firebase_api_url(endpoint):
    return f'https://identitytoolkit.googleapis.com/v1/accounts:{endpoint}?key={os.environ.get("FIREBASE_API_KEY")}'

def make_firebase_request(endpoint, payload):
    url = get_firebase_api_url(endpoint)
    response = requests.post(url, json=payload)
    result = response.json()
    if 'error' in result:
        raise Exception(result['error']['message'])
    return result

def send_verification_email(id_token):
    try:
        payload = {
            "requestType": "VERIFY_EMAIL",
            "idToken": id_token
        }
        make_firebase_request('sendOobCode', payload)
        return True
    except Exception as e:
        print(f"Error sending verification email: {str(e)}")
        return False

def verify_email_with_code(oob_code):
    payload = {
        "oobCode": oob_code
    }
    return make_firebase_request('update', payload)

# User Helpers
def get_user_role(user_id):
    user_doc = db.collection('users').document(user_id).get()
    return user_doc.to_dict().get('role', 'user') if user_doc.exists else 'user'

def check_user_permission(current_user_id, target_user_id, required_role='secretary'):
    if current_user_id == target_user_id:
        return True
    return get_user_role(current_user_id) == required_role

# Email Verification Endpoints
@app.route('/send_verification_email', methods=['POST'])
def send_verification_email_endpoint():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    
    try:
        user = auth.get_user_by_email(email)
        send_verification_email(user.uid)
        return jsonify({"message": "Verification email sent successfully"})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/verify_email', methods=['POST'])
def verify_email_endpoint():
    data = request.get_json()
    oob_code = data.get('oobCode')
    
    if not oob_code:
        return jsonify({'error': 'Verification code is required'}), 400
    
    try:
        verify_email_with_code(oob_code)
        return jsonify({"message": "Email verified successfully"})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# User Creation
@app.route('/create_user', methods=['POST'])
def create_user():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['email', 'password', 'firstName', 'lastName', 'phone']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    try:
        # Sign up user and get ID token
        signup_payload = {
            "email": data['email'],
            "password": data['password'],
            "returnSecureToken": True
        }
        signup_result = make_firebase_request('signUp', signup_payload)
        
        id_token = signup_result.get('idToken')
        uid = signup_result.get('localId')
        
        if not id_token or not uid:
            return jsonify({'error': 'Failed to create user account'}), 500

        # Store user data in Firestore
        user_data = {
            'firstName': data['firstName'],
            'lastName': data['lastName'],
            'phone': data['phone'],
            'role': 'user',
            'createdAt': firestore.SERVER_TIMESTAMP,
            'lastUpdatedDate': firestore.SERVER_TIMESTAMP,
        }
        db.collection('users').document(uid).set(user_data)
        
        # Send verification email
        send_verification_email(id_token)
        
        return jsonify({
            "message": "User created successfully. Please check your email to verify your account before logging in.",
            "userId": uid,
            "email": data['email'],
            "role": "user",
            "emailVerified": False
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Login
@app.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    try:
        # Sign in user
        signin_payload = {
            "email": email,
            "password": password,
            "returnSecureToken": True
        }
        result = make_firebase_request('signInWithPassword', signin_payload)

        # Check if email is verified
        user = auth.get_user_by_email(email)
        if not user.email_verified:
            return jsonify({'error': 'Email not verified. Please verify your email first.'}), 401

        uid = result['localId']

        # Set session
        session.permanent = True
        session['user_id'] = uid
        session['email'] = email

        # Get user role and details
        user_doc = db.collection('users').document(uid).get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            session['role'] = user_data.get('role', 'user')
            session['firstName'] = user_data.get('firstName', 'user')
            session['lastName'] = user_data.get('lastName', 'user')

        return jsonify({
            "message": "Login successful",
            "userId": uid,
            "email": email,
            "role": session.get('role', 'user')
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

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


def send_email(s_email, s_password, r_email, data, documentId, type, status):
    sender_email = s_email # Replace with your email address
    sender_password = s_password # Replace with your email (App) Password
    receiver_email = r_email

    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = receiver_email

    if (status == "create"):
        message["Subject"] = f"New {str.capitalize(type)} Created - {documentId}"
        if (type == "ticket"):
            body = f"A new {type} has been created:\nTitle: {data['title']}\nDescription: {data['description']}\n\nBy {session.get('firstName')} {session.get('lastName')}"
        elif (type == "appointment"):
            body = f"A new {type} has been created:\nTitle: {data['title']}\nDescription: {data['description']}\nAppointment Date: {data['appointmentDate']}\n Appointment Time: {data['appointmentTime']}\n\nBy {session.get('firstName')} {session.get('lastName')}"
    
    elif (status == "update"):
        message["Subject"] = f"{str.capitalize(type)} Updated - {documentId}"
        body = f"Your {type} has been updated:\nTitle: {data['title']}\nDescription: {data['description']}\nStatus: {data['status']}\nFeedback: {data['feedback']}\n\nThanks,\nSmart Secretary System"
    
    message.attach(MIMEText(body, "plain"))

    try:
        # SMTP Server
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(message)
        server.quit()
        print("Email sent successfully")
    except Exception as e:
        print(f"Error sending email: {e}")


# ===== USERS CRUD =====

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
    
    # Send email notification to secretary
    sender_email = "official.smartsecretarysystem@gmail.com" # User
    sender_password = "ygrf wpsi vblg dggi"
    reciever_email = "nivad94643@idoidraw.com" # Secretary - add any temp mail
    if reciever_email:
        send_email(sender_email, sender_password, reciever_email, ticket_data, ticket_ref[1].id, "ticket", "create")
    
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
    ticket_doc = db.collection('tickets').document(ticket_id).get()
    ticket_data = ticket_doc.to_dict()

    # Send email notification to user
    sender_email = "official.smartsecretarysystem@gmail.com" # Secretary
    sender_password = "ygrf wpsi vblg dggi"
    reciever_email = "nivad94643@idoidraw.com" # User - add any temp mail
    if reciever_email:
        send_email(sender_email, sender_password, reciever_email, ticket_data, ticket_id, "ticket", "update")
    
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

# Allowed time slots for appointments
ALLOWED_TIME_SLOTS = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
]

@app.route('/create_appointment', methods=['POST'])
@require_auth
def create_appointment():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['title', 'description', 'appointmentDate', 'appointmentTime']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Validate appointment date and time
    try:
        appointment_date = datetime.strptime(data['appointmentDate'], '%Y-%m-%d').date()
        current_date = datetime.now().date()
        
        if appointment_date < current_date:
            return jsonify({'error': 'Cannot book appointments in the past. Please select a future date.'}), 400
        elif appointment_date == current_date:
            # For today's date, check if the time slot is in the past
            current_time = datetime.now().time()
            appointment_time = datetime.strptime(data['appointmentTime'], '%I:%M %p').time()
            if appointment_time < current_time:
                return jsonify({'error': 'Cannot book appointments in past time slots. Please select a future time.'}), 400
    except ValueError:
        return jsonify({'error': 'Invalid date or time format'}), 400
    
    # Validate appointment time is in allowed slots
    if data['appointmentTime'] not in ALLOWED_TIME_SLOTS:
        return jsonify({'error': 'Invalid time slot. Please select a valid time slot.'}), 400
    
    # Check if there's already an appointment at this date and time
    existing_appointments = db.collection('appointments').where('appointmentDate', '==', data['appointmentDate']).where('appointmentTime', '==', data['appointmentTime']).get()
    
    if len(existing_appointments) > 0:
        return jsonify({'error': 'This time slot is already booked. Please choose a different time.'}), 400
    
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

    # Send email notification to secretary
    sender_email = "official.smartsecretarysystem@gmail.com" # User
    sender_password = "ygrf wpsi vblg dggi"
    reciever_email = "nivad94643@idoidraw.com" # Secretary - add any temp mail
    if reciever_email:
        send_email(sender_email, sender_password, reciever_email, appointment_data, appointment_ref[1].id, "appointment", "create")
    
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
    appointment_data = appointment_doc.to_dict()

    # Send email notification to user
    sender_email = "official.smartsecretarysystem@gmail.com" # Secretary
    sender_password = "ygrf wpsi vblg dggi"
    reciever_email = "nivad94643@idoidraw.com" # User - add any temp mail
    if reciever_email:
        send_email(sender_email, sender_password, reciever_email, appointment_data, appointment_id, "appointment", "update")
    
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


@app.route('/check_time_slot_availability', methods=['GET'])
@require_auth
def check_time_slot_availability():
    date = request.args.get('date')
    time = request.args.get('time')
    
    if not date or not time:
        return jsonify({'error': 'Date and time are required'}), 400
    
    # Validate date and time
    try:
        appointment_date = datetime.strptime(date, '%Y-%m-%d').date()
        current_date = datetime.now().date()
        
        if appointment_date < current_date:
            return jsonify({'error': 'Cannot check availability for past dates', 'isAvailable': False}), 400
        elif appointment_date == current_date:
            # For today's date, check if the time slot is in the past
            current_time = datetime.now().time()
            appointment_time = datetime.strptime(time, '%I:%M %p').time()
            if appointment_time < current_time:
                return jsonify({'error': 'Cannot check availability for past time slots', 'isAvailable': False}), 400
    except ValueError:
        return jsonify({'error': 'Invalid date or time format', 'isAvailable': False}), 400
    
    # Validate time is in allowed slots
    if time not in ALLOWED_TIME_SLOTS:
        return jsonify({'error': 'Invalid time slot', 'isAvailable': False}), 400
    
    # Check if there's already an appointment at this date and time
    existing_appointments = db.collection('appointments').where('appointmentDate', '==', date).where('appointmentTime', '==', time).get()
    
    is_available = len(existing_appointments) == 0
    return jsonify({'isAvailable': is_available})


# ===== RESOURCES CRUD =====

@app.route('/create_resource', methods=['POST'])
@require_secretary_role
def create_resource():
    # Check if request is form-data
    if request.content_type and 'multipart/form-data' in request.content_type:
        data = {
            'title': request.form.get('title'),
            'description': request.form.get('description'),
            'type': request.form.get('type'),
            'file': request.files.get('file')
        }
    else:
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

    # Handle file upload if present
    if 'file' in data and data['file']:
        try:
            # Get file data and original file name
            file_data = data['file']
            file_name = file_data.filename  # Get the original file name from the uploaded file
            
            # Upload to Supabase storage using original file name
            bucket_name = 'resources'
            storage.from_(bucket_name).upload(file_name, file_data.read())

            # Get public URL of the uploaded file
            file_url = storage.from_(bucket_name).get_public_url(file_name)
            # Add download parameter to force download
            file_url = f"{file_url}download={file_name}"
            
            # Add file URL to resource data
            resource_data['fileUrl'] = file_url
            resource_data['fileName'] = file_name  # Store original file name
        except Exception as e:
            return jsonify({'error': f'Failed to upload file: {str(e)}'}), 500
    
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
    # Check if request is form-data
    if request.content_type and 'multipart/form-data' in request.content_type:
        data = {
            'resourceId': request.form.get('resourceId'),
            'title': request.form.get('title'),
            'description': request.form.get('description'),
            'type': request.form.get('type'),
            'file': request.files.get('file')
        }
    else:
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
    
    # Handle file upload if present
    if 'file' in data and data['file']:
        try:
            # Get file data and original file name
            file_data = data['file']
            file_name = file_data.filename  # Get the original file name from the uploaded file
            
            # Upload to Supabase storage using original file name
            bucket_name = 'resources'
            storage.from_(bucket_name).upload(file_name, file_data.read())
            
            # Get public URL of the uploaded file
            file_url = storage.from_(bucket_name).get_public_url(file_name)
            # Add download parameter to force download
            file_url = f"{file_url}download={file_name}"
            
            # Add file URL to resource data
            updated_data['fileUrl'] = file_url
            updated_data['fileName'] = file_name  # Store original file name
        except Exception as e:
            return jsonify({'error': f'Failed to upload file: {str(e)}'}), 500
    
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
    
    # Get resource data
    resource_data = resource_doc.to_dict()
    
    # Delete file from Supabase if it exists
    if 'fileName' in resource_data:
        try:
            bucket_name = 'resources'
            storage.from_(bucket_name).remove(resource_data['fileName'])
        except Exception as e:
            return jsonify({
                'error': f'Failed to delete file from storage: {str(e)}'
            }), 500
    
    # Delete resource from Firestore
    try:
        db.collection('resources').document(resource_id).delete()
        return jsonify({
            "message": "Resource and associated file deleted successfully"
        })
    except Exception as e:
        return jsonify({
            'error': f'Failed to delete resource: {str(e)}'
        }), 500


# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True, port=5000)