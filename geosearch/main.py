import requests as req
from urllib import urlencode
import json
import csv

filename = "datos_delincuencia.csv"
addr_file_out = "direcciones.csv"
def gather_address():
    dir_set = set()
    with open(filename) as csvfile:
        # La primera fila indicara los campos
        reader = csv.DictReader(csvfile)
        url_base = "http://nominatim.openstreetmap.org/search/pe/lima/lima/"
        for i,row in enumerate(reader):
            dir_set.add((row["via"].strip(), row["nom"].strip(), row["cua"].strip()))
            if not i%10000:
                print "Parseado: {row}".format(row=i)

    with open(addrfile_out, "w") as out:
        for address in dir_set:
            out.write(",".join(address)+"\n")

    return dir_set
