# FCIT KAU IT Secretary System

A specialized web application designed for the Faculty of Computing and Information Technology (FCIT) at King Abdulaziz University (KAU). This system streamlines the process of managing IT support services, allowing students to book appointments, create support tickets, and access IT resources, while enabling IT secretaries to efficiently manage these requests.

## System Overview

The FCIT KAU IT Secretary System serves as a centralized platform for managing IT support services within the faculty. It provides three main functionalities:

### 1. Appointment Management

- Students can book appointments with IT secretaries for technical support
- Real-time availability checking prevents double bookings
- Smart validation prevents booking past dates and time slots
- Students can track their appointment status (In Progress, Approved, Rejected)
- IT secretaries can manage and update all appointments
- IT secretaries can provide feedback on appointments
- Students can view secretary's feedback on their appointments

### 2. Support Tickets

- Students can create tickets for IT-related issues
- Each ticket includes a title, description, and status tracking
- Students can monitor their ticket status (In Progress, Resolved)
- IT secretaries can provide feedback on resolved tickets
- Students can view secretary's feedback on their tickets
- IT secretaries can efficiently manage and update tickets

### 3. IT Resources

- Centralized repository for IT-related resources and documentation
- IT secretaries can upload and organize resources
- Students can access relevant IT documentation and guides
- Resources are categorized for easy navigation
- Access control ensures proper management of resources

## User Roles

### Students

- Can book IT support appointments
- Can create and track support tickets
- Can access IT resources and documentation
- Can view their own appointments and tickets
- Can view secretary's feedback on their appointments and tickets

### IT Secretaries

- Can manage all appointments
- Can update appointment statuses
- Can provide feedback on appointments and tickets
- Can manage and resolve support tickets
- Can upload and manage IT resources
- Have full access to system management

## Security and Privacy

- Role-based access control ensures proper separation of duties
- Students can only access their own appointments and tickets
- IT secretaries have appropriate access levels for their responsibilities
- All data is securely stored and managed
- Authentication ensures only authorized users can access the system

## Technical Implementation

The system is built using modern web technologies:

- Frontend: React.js with responsive design
- Backend: Flask (Python) for robust API handling
- Database: Firebase Firestore for secure data storage
- File Storage: Supabase for resource management
- Authentication: Firebase Authentication for secure access

