#!/usr/bin/python
# This script takes care of parsing the raw meteorites data file downloaded
# from NASA. Since we only need the meteorite's mass, time, latitude, and
# longitude, we will strip out those fields into our own JSON file.
# Author: Alvin Lin (alvin.lin@stuypulse.com)

import json

def main():
  with open('meteorites.raw.json') as meteorites_file:
    data = json.loads(meteorites_file.read())['data']

  parsed_fields = {}
  for item in data:
    if item[12] and item[15] and item[16]:
      parsed_fields[item[8]] = {
        'mass': float(item[12]),
        'time': item[14],
        'latitude': float(item[15]),
        'longitude': float(item[16])
      }

  with open('meteorites.json', 'w') as meteorites_file:
    meteorites_file.write(json.dumps(parsed_fields, sort_keys=True,
                                     encoding='utf-8', indent=2,
                                     separators=(',', ': ')))
  print 'Finished writing meteorites.json'

if __name__ == '__main__':
  main()
