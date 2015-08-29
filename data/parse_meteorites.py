#!/usr/bin/python

import json

def main():
  with open('meteorites.raw.json') as meteorites_file:
    data = json.loads(meteorites_file.read())['data']

  parsed_fields = {}
  for item in data:
    parsed_fields[item[8]] = {
      'mass': item[12],
      'time': item[14],
      'latitude': item[15],
      'longitude': item[16]
    }

  with open('meteorites.json', 'w') as meteorites_file:
    meteorites_file.write(json.dumps(parsed_fields, sort_keys=True,
                                     encoding='utf-8', indent=2,
                                     separators=(',', ': ')))
  print 'Finished writing meteorites.json'

if __name__ == '__main__':
  main()
