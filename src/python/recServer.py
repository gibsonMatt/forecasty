"""
The song recommender. Run as flask server on port 5000. 
That way we dont have to load the dataset each time a req is made (its like 3 Gb)
"""

import sys
import pandas as pd
from flask import Flask, request
from pyowm import OWM
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

#Initial operations on dataset at server start.
dataset = pd.read_csv('./datasets/track_features/reducedDataset.csv')
cutoff = dataset["CompositeMetric"].median()
datasetSlow = dataset[dataset['CompositeMetric']<cutoff]
datasetFast = dataset[dataset['CompositeMetric']>cutoff]

sadWeatherStatuses = ['thunderstorm', 'drizzle', 'rain', 'snow', 'mist', 'tornado', 'clouds']

def getSong(datasetSlow, datasetFast, cutoff, slowfast = True):    
    if slowfast:
        song = datasetFast.sample()
    else:
        song = datasetSlow.sample()
    song = song.iloc[:,1].to_string(header=False, index=False)
    return(song)

@app.route('/flask/coords', methods=['GET'])
def rec():

    lat = float(request.args.get('lat'))
    lng = float(request.args.get('lng'))

    owm = OWM('5660c0b19c206d73cc540654cd1537dc')
    mgr = owm.weather_manager()
    # observation = mgr.weather_at_place('Indianapolis, US')
    observation = mgr.weather_at_coords(lat, lng)
    print(observation.weather.status)
    w = observation.weather
    status = w.status

    if status in sadWeatherStatuses:
        song = getSong(datasetSlow, datasetFast, False)
    else:
        song = getSong(datasetSlow, datasetFast, True)
    return(song)


# @app.route('/flask/<city>/<country>', methods=['GET'])
# def rec(city, country):

#     owm = OWM('5660c0b19c206d73cc540654cd1537dc')
#     mgr = owm.weather_manager()
#     # observation = mgr.weather_at_place('Indianapolis, US')
#     observation = mgr.weather_at_place(city + ', ' + country)
#     print(observation.weather.status)
#     w = observation.weather
#     status = w.status

#     if status in sadWeatherStatuses:
#         song = getSong(datasetSlow, datasetFast, False)
#     else:
#         song = getSong(datasetSlow, datasetFast, True)
#     return(song)

if __name__ == "__main__":
    app.run(port=5000, debug=True)