import hashlib

def hash_password(password):
    # Hash the password using SHA-256
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    return hashed_password

def register(username, password):
    # Encrypt the password
    encrypted_password = hash_password(password)
    
    # Save the registration data to a file
    with open('user_data.txt', 'a') as f:
        f.write(f"{username}:{encrypted_password}\n")

def login(username, password):
    # Encrypt the password
    encrypted_password = hash_password(password)
    
    # Compare with saved encrypted password
    with open('user_data.txt', 'r') as f:
        for line in f:
            stored_username, stored_encrypted_password = line.strip().split(':')
            if username == stored_username and encrypted_password == stored_encrypted_password:
                print("Login successful!")
                return True
    
    print("Invalid username or password.")
    return False

# Example usage
register("user1", "password123")
login("user1", "password123")
