import pandas as pd
from membres.models import Membres

def load_data_from_excel(excel_file):
    df = pd.read_excel(excel_file)
    for index, row in df.iterrows():
        membre = Membres(
            nom=row['NOM'],
            postnom=row['POSTNOM'] if 'POSTNOM' in row else '',
            prenom=row['PRENOM'],
            sexe=row['SEXE'],
            contact=row['CONTACT'],
            deja_baptiser=row['DEJA_BAPTISER'] == 'OUI',
            eglise=row['Eglise'],
            servir_avec_nous=row['servir_avec_nous'] == 'OUI',
            besoin_de_priere=row['Besoin_de_priere'] == 'OUI',
            requete_priere=row['requete_priere'],
            suggestion_amelioration=row['suggestion_amelioraion'],
            categorie_membres=row['categorie_membres'],
            ville=row['Ville'],
            quartier=row['Quartier'],
            avenue=row['Avenue'],
            numero=row['Numero']
        )
        membre.save()

if __name__ == '__main__':
    load_data_from_excel('BASE_DE_DONNEES_MGJ_JUIN_2025.xlsx')