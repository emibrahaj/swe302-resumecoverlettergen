from supabase import Client

from backend.schemas.AuthSchema import UserRegister, UserLogin

class AuthService:
    def __init__(self, db_client: Client):
        self.db_client = db_client

    def register(self, user_data: UserRegister):
        # creates a new user in the db
        response = self.db_client.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {"data": {"full_name": user_data.full_name}}
        })
        return response

    def register_company(self, company_data):
        # create auth user
        auth_response = self.db_client.auth.sign_up({
            "email": company_data.email,
            "password": company_data.password
        })

        if not auth_response or not auth_response.user:
            raise ValueError("Company registration failed: missing authenticated user email")

        user_id = auth_response.user.id
        try:
            rpc_params = {
                "p_company_name": company_data.company_name,
                "p_admin_id": user_id,
                "p_email": company_data.email,
                "p_website": company_data.company_website,
                "p_logo": company_data.logo_url,
                "p_description": company_data.description
            }
            rpc_res = self.db_client.rpc("register_company_and_admin", rpc_params).execute()
            return {
                "user": auth_response.user,
                "company_id": rpc_res.data
            }
        except Exception as e:
            self.db_client.auth.admin.delete_user(user_id)
            raise e

    def login(self, data: UserLogin):
        # logs in an existing user and returns a JWT session
        response = self.db_client.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })
        return response

    def logout(self):
        # logs out the current user by invalidating the JWT session
        return self.db_client.auth.sign_out()
