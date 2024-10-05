from flask_restful import Resource, reqparse
from models.company import Company as CompanyModel
from flask import request
import json

class Company(Resource):
    def post(slef):
        parser = reqparse.RequestParser()
        parser.add_argument('company_name', required=True, help='company_name is required')
        parser.add_argument('company_wallet_address', required=True, help='company_wallet_address is required')
        parser.add_argument('company_logo', help='company_logo is required')
        parser.add_argument('company_twitter', help='company_twitter is required')
        parser.add_argument('company_website', help='company_website is required')

        args = parser.parse_args()
        response = CompanyModel.add_company(args)

        if response['error']:
            return {'error': True, 'message': response['message']}
        
        return {'error': False, 'data': json.loads(response['data'].to_json())}
    
    def get(self):
        company_name = request.args.get('company_name')
        company_wallet_address = request.args.get('company_wallet_address')
        
        if company_name:
            response = CompanyModel.get_company_by_name(company_name)
        elif company_wallet_address:
            response = CompanyModel.get_company_by_wallet_address(company_wallet_address)
        else:
            response = CompanyModel.get_all_companies()
            
        if response['error']:
            return {'error': True, 'message': response['message']}
        
        return {'error': False, 'data': json.loads(response['data'].to_json())}
