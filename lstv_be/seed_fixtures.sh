python manage.py dumpdata --format=json --output ../fixtures/seed_aggregation_cache.json lstv_api_v1.AggregationCache
python manage.py dumpdata --format=json --output ../fixtures/seed_card_grid_type.json lstv_api_v1.CardGridType
python manage.py dumpdata --format=json --output ../fixtures/seed_settings.json lstv_api_v1.Setting
python manage.py dumpdata --format=xml --output ../fixtures/seed_country.xml lstv_api_v1.Country
python manage.py dumpdata --format=xml --output ../fixtures/seed_state_province.xml lstv_api_v1.StateProvince
python manage.py dumpdata --format=xml --output ../fixtures/seed_place.xml lstv_api_v1.Place
aws s3 cp ../fixtures/  s3://lstv2-eks/fixtures --recursive --acl public-read

