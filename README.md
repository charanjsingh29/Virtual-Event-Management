# Virtual-Event-Management

Virtual Event Management is a backend application for managing virtual events. It allows users to sign up, log in, create events, subscribe to events, and manage their subscriptions. The application uses Node.js, Express, MongoDB, and JWT for authentication.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [License](#license)

## Installation

1. Clone the repository:
    ```sh
    git clone git@github.com:charanjsingh29/Virtual-Event-Management.git
    cd Virtual-Event-Management
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a [.env](http://_vscodecontentref_/1) file from .env.sample file

## Configuration

- [constants.js](http://_vscodecontentref_/2): Contains configuration constants for the application.
- [email.js](http://_vscodecontentref_/3): Configures the email transporter using Nodemailer.

## Usage

1. Start the development server:
    ```sh
    npm run dev
    ```

2. The server will start on the port specified in the [.env](http://_vscodecontentref_/4) file (default is 3000).

## API Endpoints

### User Authentication

- **Sign Up**
    - `POST /user/signup`
    - Request Body:
        ```json
        {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "password": "password123",
            "roles": ["participant"]
        }
        ```

- **Login**
    - `POST /user/login`
    - Request Body:
        ```json
        {
            "email": "john.doe@example.com",
            "password": "password123"
        }
        ```

### Event Management

- **Create Event**
    - `POST /event`
    - Requires organiser role
    - Request Body:
        ```json
        {
            "title": "Virtual Conference",
            "description": "A conference on virtual events",
            "date": "2023-12-01T10:00:00Z"
        }
        ```

- **Get Public Events**
    - `GET /event`

- **Get Own Events**
    - `GET /event/own`
    - Requires organiser

- **Update Event**
    - `PUT /event/:id`
    - Requires organiser role
    - Request Body:
        ```json
        {
            "title": "Updated Conference",
            "description": "Updated description",
            "date": "2023-12-02T10:00:00Z"
        }
        ```

- **Delete Event**
    - `DELETE /event/:id`
    - Requires organiser role

### Event Subscriptions

- **Subscribe to Event**
    - `GET /event/:id/subscribe`
    - Requires participant role

- **Unsubscribe from Event**
    - `GET /event/:id/unsubscribe`
    - Requires participant role

- **Get Subscriptions**
    - `GET /event/subscriptions`
    - Requires participant role

- **Get Event Subscribers**
    - `GET /event/:id/subscribers`
    - Requires organiser role

## Testing

To run the tests, use the following command:
```sh
npm test
