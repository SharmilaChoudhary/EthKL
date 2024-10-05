from flask import Flask, request, jsonify
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.date import DateTrigger
import datetime

app = Flask(__name__)
scheduler = BackgroundScheduler()
scheduler.start()

# Sample data structure to hold schedules (this should be stored in a database in a real-world scenario)
schedules = []

def distribute_funds(payload=None):
    with app.app_context():  # Create an application context
        # Logic to distribute funds
        response = {"message": "Funds distributed", "data": payload}
        print(response)  # Print the response to the console for confirmation
        return response

@app.route('/distributefunds', methods=['POST'])
def distribute_funds_endpoint():
    data = request.json
    return distribute_funds(data)

@app.route('/schedulefunds', methods=['POST'])
def schedule_funds():
    data = request.json
    company_name = data.get('company_name')
    distribution_time = data.get('distribution_time')
    payload = data.get('payload')
    
    # Convert the provided distribution time to a datetime object
    distribution_datetime = datetime.datetime.strptime(distribution_time, '%Y-%m-%d %H:%M:%S')
    
    # Schedule the job
    job = scheduler.add_job(
        distribute_funds,
        trigger=DateTrigger(run_date=distribution_datetime),
        args=[payload]
    )
    
    # Save the schedule info (In practice, save to a database)
    schedules.append({
        "company_name": company_name,
        "distribution_time": distribution_time,
        "payload": payload,
        "job_id": job.id
    })
    
    return jsonify({"message": "Funds distribution scheduled", "job_id": job.id})

if __name__ == '__main__':
    app.run(debug=True)
