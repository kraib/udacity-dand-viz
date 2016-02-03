#!/usr/bin/env python
# -*- coding: utf-8 -*-

from bs4 import BeautifulSoup
import requests
#import os
import csv


'''
def get_currency_codes():

	r = requests.get("http://www.xe.com/symbols.php")
	html = r.text
	soup = BeautifulSoup(html, "lxml")
	#print r.encoding

	data = []

	table = soup.find('table', {'class': "cSymbl_tbl"})
	rows = table.find_all("tr")[1:]

	for row in rows:

	  country = row.find("a").contents[0]
	  country = country.split()[0:-1]
	  country = " ".join(country)
	  
	  currency = row.find_all("td")[1].contents[0]
	  data.append([country, currency])

	return data
'''


def get_xrate():

	r = requests.get("http://www.xe.com/currencytables/?from=USD&date=2015-06-24")
	html = r.text
	soup = BeautifulSoup(html, "lxml")
	#print r.encoding

	data = []

	table = soup.find('table', {'id': "historicalRateTbl"}).find("tbody")
	rows = table.find_all("tr")

	for row in rows:

		code = row.find("a").contents[0]
		elements = row.find_all("td")
		rate = elements[2].contents[0]

		data.append([code, rate])

	return data



if __name__ == "__main__":

	with open('xrates-2015.csv', 'wb') as f_out:
	    data = get_xrate()
	    writer = csv.writer(f_out)
	    writer.writerow(["Currency_Code", "USDxrate"])
	    for pair in data:
	      	writer.writerow(pair)

