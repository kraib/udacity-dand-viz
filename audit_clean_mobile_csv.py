#!/usr/bin/env python
# -*- coding: utf-8 -*-

import csv
import re
from collections import defaultdict




# repeat code here but better if these are stand alone functions



def audit_field_types(filename):

    type_data = defaultdict(set)

    with open(filename, "r") as fin:

        reader = csv.DictReader(fin)

        for line in reader:

            for field in line:

                field_type = type(line[field])
                type_data[field].add(field_type)

    return type_data





word = re.compile("[A-Za-z]")

def audit_fields(filename):

    bad_data = defaultdict(set)
    bad_data_instances = []

    # these fields shouldn't have any characters
    numbers = ['Usage allowance', 'Validity (days)', 'Cost']

    with open(filename, "r") as fin:

        reader = csv.DictReader(fin)

        for line in reader:

            for field in line:

                if(field in numbers):

                    if word.match(line[field]):

                        bad_data[field].add(line[field])
                        bad_data_instances.append(line)
            
    bad_data_countries = [instance['Country'] for instance in bad_data_instances]

    return bad_data, bad_data_countries




def process_file(filename):

    data = []

    with open(filename, "r") as fin:

        reader = csv.DictReader(fin)
        header = reader.fieldnames

        for line in reader:

            # again, these fields should be numbers rather than strings
            usage = line['Usage allowance']
            expiry = line['Validity (days)']
            cost = line['Cost']

            if(word.match(usage)):
                continue
            '''
            usage = float(usage)
            usage = float(expiry)
            usage = float(cost)
            '''

            data.append(line)


    return header, data





if __name__ == "__main__":


    filename = "mobile-parameters-q2-2015.csv"


    #print audit_field_types(filename)
    # all fields are type string


    # some data we want numerical,
    # see if numerical string data have any characters.
    #print audit_fields(filename)
    # 'Usage allowance' has some characters in it.
    # the bad instances are relatively spread and not enough data to compare unlimited plans
    # we can omit them when processing the file.


    fieldnames, data = process_file(filename)

    with open("mobile-parameters-q2-2015-updated.csv", 'wb') as f_out:
        writer = csv.DictWriter(f_out, fieldnames=fieldnames)
        writer.writeheader()
        for line in data:
            writer.writerow(line)
    