#!/usr/bin/python
# This script analyzes meteorites.json and compiles a list of the top ten meteorite
# hotspots worldwide.

import json

def main():
  with open('meteorites.json') as meteorites_input:
    meteorites = json.loads(meteorites_input.read())

  latitude_frequencies = {}
  longitude_frequencies = {}
  for meteor in meteorites:
    nearest_latitude = round(meteorites[meteor]['latitude'])
    nearest_longitude = round(meteorites[meteor]['longitude'])
    if latitude_frequencies.get(nearest_latitude, None):
      latitude_frequencies[nearest_latitude] += 1
    else:
      latitude_frequencies[nearest_latitude] = 1
    if longitude_frequencies.get(nearest_longitude, None):
      longitude_frequencies[nearest_longitude] += 1
    else:
      longitude_frequencies[nearest_longitude] = 1

  sorted_latitudes = sorted(latitude_frequencies,
                            key=latitude_frequencies.get)[:-1][::-1]
  sorted_longitudes = sorted(longitude_frequencies,
                             key=longitude_frequencies.get)[:-1][::-1]

  i = 0
  hotspots = []
  while i < 10:
    hotspots.append({
        'lat': sorted_latitudes[i],
        'lng': sorted_longitudes[i]
    })
    i += 1

  with open('hotspots.json', 'w') as meteorites_input:
    meteorites_input.write(json.dumps(hotspots, sort_keys=True,
                                      encoding='utf-8', indent=2,
                                      separators=(',', ': ')))
  print 'Successfully wrote hotspots.json'

if __name__ == '__main__':
  main()
