#!/usr/bin/python
# This is a script to test the API key.

import requests

BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json'

def main():
  response = requests.get(BASE_URL, params={
      'address': '1164 67th Street',
  })
  print response.text
  print 'Status code:%s' % response.status_code

if __name__ == '__main__':
  main()
