# Accessible Chennai Database Schema (Initial)

- users
  - id (PK)
  - email
  - password_hash
  - google_id
  - preferences (JSON: language, mode, theme)
  - saved_places (JSON)

- alerts
  - id (PK)
  - category (transport, roadway, accessibility)
  - message
  - created_at
  - location (optional)

- community_messages
  - id (PK)
  - user_id (FK)
  - message
  - image_url (optional)
  - created_at
  - type (chat, review, emergency)

- routes
  - id (PK)
  - user_id (FK)
  - start_location
  - destination
  - accessibility_filters (JSON)
  - created_at
