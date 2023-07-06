Filtrar nomes per aquells que el content type sigui number

Crear diferents buckets per
- status
- analysis
- project

Per tant realemnt l'ordre seria
- Project
      - Analysis
          - Status


Creariem un Buket per projecte per analysis
el project ID sera agrupat
l'analysis sera agrupat, 
updatedAt sera el temps en format llegible
key sera la key que toqui
type sera  "line", "bar", "pie", "area", "scatter", "radar", 
title sera Projecte-Analysis-Type
xAxis sera el temps
yAxis chartdatakey
datasets contindra
color segons document tmb specific color
label segons document
dataset segons{
  createdAt data
  value data
}
