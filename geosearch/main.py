# -*- coding: utf-8 -*-
import requests as req
from urllib.parse import urlencode
import json
import csv
import logging
import unicodedata
import time

logger = logging.getLogger("Direccion")
logger.handlers = []
fhandler = logging.FileHandler(filename='direcciones.log', mode='a')
formatter = logging.Formatter('%(asctime)s %(name)s %(levelname)s %(message)s')
fhandler.setFormatter(formatter)
logger.addHandler(fhandler)
logger.setLevel(logging.ERROR)

filename = "datos_delincuencia.csv"
addr_file_out = "direcciones.csv"


def gather_address():
    dir_set = set()
    with open(filename) as csvfile:
        # La primera fila indicara los campos
        reader = csv.DictReader(csvfile)
        url_base = "http://nominatim.openstreetmap.org/search/pe/lima/lima/"
        for i,row in enumerate(reader):
            res = (row["via"].strip(), row["nom"].strip(), row["cua"].strip())
            dir_set.add(res)
            if not i%10000:
                print("Parseado: {row}".format(row=i))

    with open(addr_file_out, "w") as out:
        for address in dir_set:
            out.write(",".join(address)+ "\n")

    return dir_set

url_base ="http://nominatim.openstreetmap.org/search/pe/lima/lima/"
params = urlencode((("format","json"),("addressdetails",1),("polygon_geojson",1), ("email", "pedro_gpa@hotmail.com")))

def get_url_data(via, nombre, cuadra) :
    return via + " " + nombre + ("/" + cuadra) if cuadra else ""

def do_request(via, nombre, cuadra):
    url = url_base + get_url_data(via,nombre,cuadra) + "?" + params
    print(url)
    while True:
            try:
                r = req.get(url,headers={'User-Agent': 'Pedro Palacios - pedro_gpa@hotmail.com'})
            except req.exceptions.Timeout:
                print("Timeout error")
                continue
            except req.exceptions.ConnectionError as error:
                errno = error.errno
                err_msg = "ConnectionError"
                if errno == 101:
                    err_msg += (": Esta conectado a internet?")
                print(err_msg)
                continue
            except Exception as e:
                print("Excepcion: " + str(e))
                continue
            else:
                try:
                    data = r.json()
                except:
                    print("No se puede parsear json:\n {texto}".format(texto=r.text))
                else:
                    break
                # Filtramos los que sean de cercado de Lima
    results = [d for d in data if d["address"].get("city", "").lower() == "lima"]
    if not len(results):
        logger.error(u"Error en direccion: {via},{nombre},{cuadra}"
                     .format(via=via,nombre=nombre,cuadra=cuadra))
        return None
    
    first = results[0]
    res_dict = {
        "bounding_box": first["boundingbox"],
        "osm_id": first["osm_id"],
        "class": first["class"],
        "lat": first["lat"],
        "lon": first["lon"],
        "geojson": first["geojson"],
    }
    logger.info("Descargada direccion: {via},{nombre},{cuadra}"
                .format(via=via,nombre=nombre,cuadra=cuadra))
    return res_dict


if __name__ == "__main__":
    set_dir = gather_address()
    address_dir = {}
    f = open("salida.txt", "w")
    for item in set_dir:
        res = do_request(*item)
        if not res:
            continue
        print(res)
        f.write(item + "////" + json.dumps(res))
        f.flush()
        address_dir[item] = res
        time.sleep(0.6)
