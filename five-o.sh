#!/bin/sh

#===============================================================================
#=========================== CERTIFICATE GENERATOR =============================
#===============================================================================

leave_min_ago="-20min"

#=============================== Fill Fields ===================================
for i in $(seq 1 6); do
    type="$(cat ./identity.conf | awk -F': ' "{if(NR==$i) print \$1}")"
    entry="$(cat ./identity.conf | awk -F': ' "{if(NR==$i) print \$2}")"
    if [ "$type" == "Prénom" ]; then
        firstname="$entry"
    elif [ "$type" == "Nom" ]; then
        name="$entry"
    elif [ "$type" == "Date de naissance (au format jj/mm/aaaa)" ]; then
        birth_date="$entry"
    elif [ "$type" == "Lieu de naissance" ]; then
        birth_place="$entry"
    elif [ "$type" == "Adresse" ]; then
        address="$entry"
    elif [ "$type" == "Ville" ]; then
        town="$entry"
    elif [ "$type" == "Code Postal" ]; then
        zipcode="$entry"
    fi
done


#============================== Select Motive ==================================
printf "Motive: (0:travail, 1:courses, 2:sante, 3:famille, 4:sport, 5:judiciaire, 6:missions) "
read motive

while [[ ! "$motive" =~ ^[0-6]$ ]]; do
  echo "Entry should be a number between 0 and 6 !"
  printf "Motive: (0:travail, 1:courses, 2:sante, 3:famille, 4:sport, 5:judiciaire, 6:missions) "
  read motive
done

#================================ Calculate Time ===============================
leaving_date=$(date +%D)
leaving_time=$(date -d $leave_min_ago +'%H%M')
# Round to 10 mn
leaving_time=$(date -d $(echo "$leaving_time - ($leaving_time%10)" | bc) +"%Hh%M")
creation_date=$(date +%D)
# Set creation 7min before leaving
creation_time=$(date -d $(echo "$(date -d $(echo $leaving_time | tr 'h' ':') +"%H%M") - 7" | bc) +"%Hh%M")
echo "creation_date: $creation_date $creation_time"
echo "leaving_date: $leaving_date $leaving_time"

#================================ Generate PDF =================================
./certificate/generate_certificate.sh "$name" "$firstname" "$birth_date" "$birth_place" "$address" "$zipcode" "$town" "$leaving_date" "$leaving_time" "$creation_date" "$creation_time" "$motive"
mv certificate/certificate.pdf .
echo "Generate ./certificate.pdf"
