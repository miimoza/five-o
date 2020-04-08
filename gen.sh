# Requirement: npm install -g qrcode

# Fields
firstname="Antoine"
name="Coulon"
birth_date="28/04/1999"
birth_place="Nogent-sur-Marne"
address="580 Rue de la viager 73190 Challes-les-Eaux"
motive="sport"

# Calculate Time
creation_date=$(date +%D)
creation_time=$(date -d '-30min' +'%Hh%M')
leaving_date=$(date +%D)
leaving_time=$(date -d '-22min' +'%Hh%M')

echo "creation_date: $creation_date $creation_time"
echo "leaving_date: $leaving_date $leaving_time"

qrcode -o qr.png "Cree le: $creation_date a $creation_time; Nom: $name; Prenom: $firstname; Naissance: $birth_date a $birth_place; Adresse: $address; Sortie: $leaving_date a $leaving_time; Motifs: $motive"
