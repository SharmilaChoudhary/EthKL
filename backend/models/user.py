from mongo_engine import db


class User(db.Document):
    wallet_address = db.StringField(required=True, unique=True)
    oauth_token = db.StringField(unique=True)
    oauth_token_secret = db.StringField()
    oauth_verifier = db.StringField()
    # participated_campaigns = db.ListField(db.DictField())

    @classmethod
    def add_user(cls, args):
        try:
            user = cls(**args)
            user.save()
            return {"error": False, "data": user.to_json()}
        except Exception as e:
            return {"error": True, "message": str(e)}

    @classmethod
    def get_first_user(cls):
        try:
            user = cls.objects().first()
            return {"error": False, "data": user}
        except Exception as e:
            return {"error": True, "message": str(e)}

    @classmethod
    def get_all_users(cls):
        try:
            users = cls.objects()
            return {"error": False, "data": users.to_json()}
        except Exception as e:
            return {"error": True, "message": str(e)}

    @classmethod
    def get_user_by_wallet_address(cls, wallet_address):
        try:
            user = cls.objects(wallet_address=wallet_address).first()
            return {"error": False, "data": user}
        except Exception as e:
            return {"error": True, "message": str(e)}

    @classmethod
    def get_user_by_oauth_token(cls, oauth_token):
        try:
            user = cls.objects(oauth_token=oauth_token).first()
            return {"error": False, "data": user}
        except Exception as e:
            return {"error": True, "message": str(e)}

    @classmethod
    def update_user_by_oauth(cls, oauth_token, args):
        try:
            user = cls.objects(oauth_token=oauth_token).first()
            user.update(**args)
            return {"error": False, "data": user.to_json()}
        except Exception as e:
            return {"error": True, "message": str(e)}

    @classmethod
    def add_participated_campaign(cls, wallet_address, campaign_id, instagram_post_id):
        try:
            user = cls.objects(wallet_address=wallet_address).first()
            user.update(
                push__participated_campaigns={
                    "campaign_id": campaign_id,
                    "instagram_post_id": instagram_post_id,
                }
            )
            return {"error": False, "data": user.to_json()}
        except Exception as e:
            return {"error": True, "message": str(e)}
