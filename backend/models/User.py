class User:
    def __init__(self, user_id, password, created_at, last_login):
        self.user_id = user_id
        self.password = password
        self.created_at = created_at
        self.last_login = last_login

class Profile:
    def __init__(self, first_name, last_name, email):
        self.first_name = first_name
        self.last_name = last_name
        self.email = email

