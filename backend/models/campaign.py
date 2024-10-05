from mongo_engine import db
import json

class Campaign(db.Document):
    campaign_id = db.StringField(required=True, unique=True)
    campaign_name = db.StringField(required=True)
    campaign_description = db.StringField(required=True)
    company_name = db.StringField(required=True)
    start_time = db.StringField(required=True)
    end_time = db.StringField(required=True)
    payout_time = db.StringField(required=True)
    prize_pool = db.FloatField(required=True)
    post = db.StringField(required=True)
    likes = db.StringField(required=True)
    minimum_likes = db.IntField()
    followers = db.StringField(required=True)
    minimum_followers = db.IntField()
    task_id = db.StringField()
    # participants = db.ListField(db.DictField())

    @classmethod
    def add_campaign(cls, args):
        try:
            campaign = cls(**args)
            campaign.save()
            return {'error': False, 'data': campaign}
        except Exception as e:
            return {'error': True, 'data': str(e)}
        
    @classmethod
    def add_task_id(cls, args):
        try:
            campaign = cls.objects(campaign_id=args["campaign_id"]).first()
            if not campaign:
                return {'error': True, 'data': 'Campaign not found'}
            campaign.update(task_id=args["task_id"])
            return {'error': False, 'data': "Task ID added successfully"}
        except Exception as e:
            return {'error': True, 'data': str(e)}

    @classmethod
    def get_all_campaigns(cls):
        try:
            campaigns = cls.objects()
            return {'error': False, 'data': campaigns}

        except Exception as e:
            return {'error': True, 'data': str(e)}
        
    @classmethod
    def get_campaign(cls, campaign_id):
        try:
            campaign = cls.objects(campaign_id=campaign_id).first()
            return {'error': False, 'data': campaign}

        except Exception as e:
            return {'error': True, 'data': str(e)}
        
    @classmethod
    def get_campaigns_by_company(cls, company_name):
        try:
            campaigns = cls.objects(company_name=company_name)
            return {'error': False, 'data': campaigns}

        except Exception as e:
            return {'error': True, 'data': str(e)}
        
    @classmethod
    def add_participant(cls, campaign_id, args):
        try:
            campaign = cls.objects(campaign_id=campaign_id).first()
            if not campaign:
                return {'error': True, 'data': 'Campaign not found'}
            
            campaign.update(push__participants=args)
            return {'error': False, 'data': "Participant added successfully"}

        except Exception as e:
            return {'error': True, 'data': str(e)}

    @classmethod
    def get_participants(cls, campaign_id):
        try:
            campaign = cls.objects(campaign_id=campaign_id).first()
            if not campaign:
                return {'error': True, 'data': 'Campaign not found'}
            
            return {'error': False, 'data': campaign.participants}

        except Exception as e:
            return {'error': True, 'data': str(e)}
    
