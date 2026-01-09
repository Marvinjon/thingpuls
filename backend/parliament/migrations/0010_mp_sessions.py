# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('parliament', '0009_add_fyrirspurn_status_choices'),
    ]

    operations = [
        migrations.AddField(
            model_name='mp',
            name='sessions',
            field=models.ManyToManyField(
                blank=True,
                help_text='Parliamentary sessions this MP was active in',
                related_name='members',
                to='parliament.parliamentsession'
            ),
        ),
    ]

