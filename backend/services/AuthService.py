from supabase import Client

from backend.schemas.AuthSchema import UserRegister, UserLogin, CompanyRegister


class AuthService:
    def __init__(self, db_client: Client):
        self.db_client = db_client

    def register(self, user_data: UserRegister):
        auth_response = self.db_client.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {"data": {"full_name": user_data.full_name}}
        })

        if not auth_response or not auth_response.user:
            raise ValueError("User registration failed")

        user_id = auth_response.user.id
        self.db_client.table("users").upsert({
            "id": user_id,
            "name": user_data.full_name,
            "email": user_data.email,
            "role": user_data.role or "user",
        }).execute()
        self.db_client.table("user_profiles").upsert({
            "id": user_id,
            "full_name": user_data.full_name,
            "tier": "free",
        }).execute()

        return auth_response

    def register_company(self, company_data: CompanyRegister):
        try:
            auth_response = self.db_client.auth.sign_up({
                "email": company_data.email,
                "password": company_data.password,
                "options": {
                    "data": {
                        "company_name": company_data.company_name,
                        "role": "company"
                    }
                }
            })

            if not auth_response or not auth_response.user:
                raise ValueError("Company registration failed: Supabase auth user was not created")

            user_id = auth_response.user.id
            address = company_data.company_address

            users_res = self.db_client.table("users").upsert({
                "id": user_id,
                "name": company_data.company_name,
                "email": company_data.email,
                "role": "company",
            }).execute()

            companies_res = self.db_client.table("companies").upsert({
                "id": user_id,
                "email": company_data.email,
                "company_name": company_data.company_name,
                "is_verified": False,
            }).execute()

            profile_res = self.db_client.table("company_profiles").upsert({
                "id": user_id,
                "company_id": user_id,
                "company_name": company_data.company_name,
                "company_website": company_data.company_website,
                "logo_url": company_data.logo_url,
                "email": company_data.email,
                "description": company_data.description,
                "company_address": address,
            }).execute()

            return {
                "user": {
                    "id": auth_response.user.id,
                    "email": auth_response.user.email,
                },
                "company_id": user_id,
                "company": companies_res.data[0] if companies_res.data else None,
                "profile": profile_res.data[0] if profile_res.data else None,
            }

        except Exception as exc:
            raise ValueError(f"Company registration failed: {str(exc)}")

    def login(self, data: UserLogin):
        return self.db_client.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })

    def logout(self):
        return self.db_client.auth.sign_out()
