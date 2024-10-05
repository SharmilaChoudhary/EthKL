from mongo_engine import db

class Company(db.Document):
    company_name = db.StringField(required=True, unique=True)
    company_wallet_address = db.StringField(required=True, unique=True)
    company_logo = db.StringField()
    company_twitter = db.StringField()
    company_website = db.StringField()

    @classmethod
    def add_company(cls, args):
        try:
            company = cls(**args)
            company.save()
            return {'error': False, 'data': company}
        except Exception as e:
            return {'error': True, 'message': str(e)}
        
    @classmethod
    def get_all_companies(cls):
        try:
            companies = cls.objects()
            return {'error': False, 'data': companies}
        except Exception as e:
            return {'error': True, 'message': str(e)}
        
    @classmethod
    def get_company_by_name(cls, company_name):
        try:
            company = cls.objects(company_name=company_name).first()
            return {'error': False, 'data': company}
        except Exception as e:
            return {'error': True, 'message': str(e)}
        
    @classmethod
    def get_company_by_wallet_address(cls, company_wallet_address):
        try:
            company = cls.objects(company_wallet_address=company_wallet_address).first()
            return {'error': False, 'data': company}
        except Exception as e:
            return {'error': True, 'message': str(e)}