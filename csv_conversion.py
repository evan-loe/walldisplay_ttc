import pandas as pd
import pathlib
import os
from urllib.request import urlopen
from zipfile import ZipFile
from io import BytesIO
import glob

dir_path = pathlib.Path(__file__).parent.resolve()

def clean_up():
    try:
        for f in dir_path.joinpath('temp').glob('*'):
            os.remove(f)
        os.remove(dir_path.joinpath('cropped_stop_times.csv'))
    except FileNotFoundError:
        print("File not Found")
    except:
        print("Error with file")

clean_up()

link = "https://ckan0.cf.opendata.inter.prod-toronto.ca/download_resource/c1264e07-3c27-490f-9362-42c1c8f03708"

resp = urlopen(link)

with ZipFile(BytesIO(resp.read()), 'r') as zip:
    zip.extractall(path=dir_path.joinpath('temp'))

df = pd.read_csv(dir_path.joinpath('temp', 'stop_times.txt'))

#Bayview West, Sheppard-Yonge, Sheppard-Yonge South, Sheppard-Yonge North, Yonge East, Yonge West, Bloor South, Bloor North, St George East, St George West, St George North, St George South, Queen's Park North, Queen's Park South, College at St George, College at Beverley
list_of_routes = ['14538', '14539', '14406', '14465', '14485', '14512', '14414', '14457', '13856', '14514', '14426', '14445', '14425', '14447', '5013', '2748']

cropped_df = df[df['stop_id'].astype(str).isin(list_of_routes)]
cropped_df.to_csv(dir_path.joinpath('cropped_stop_times.csv'))