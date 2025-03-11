from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('parliament', '0005_politicalparty_althingi_id'),
    ]

    operations = [
        migrations.RunSQL(
            sql='ALTER TABLE parliament_bill DROP COLUMN IF EXISTS summary;',
            reverse_sql='ALTER TABLE parliament_bill ADD COLUMN summary text;'
        ),
    ] 