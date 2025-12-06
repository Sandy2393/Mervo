"""Example Airflow DAG for Mervo analytics"""
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.bash import BashOperator

# TODO: replace bash ops with BigQueryInsertJobOperator or custom operators

with DAG(
    dag_id="mervo_analytics_daily",
    schedule_interval="0 5 * * *",
    start_date=datetime(2024, 1, 1),
    catchup=False,
    default_args={"retries": 1, "retry_delay": timedelta(minutes=10)},
    tags=["analytics"],
) as dag:

    load_raw = BashOperator(
        task_id="load_raw",
        bash_command="echo 'load raw from GCS to raw_events'"
    )

    transform_staging = BashOperator(
        task_id="transform_staging",
        bash_command="echo 'run staging_events.sql'"
    )

    build_facts_dims = BashOperator(
        task_id="build_facts_dims",
        bash_command="echo 'run fact_jobs/dims'"
    )

    build_aggs = BashOperator(
        task_id="build_aggs",
        bash_command="echo 'run daily_aggregates/retention/funnel'"
    )

    data_quality = BashOperator(
        task_id="data_quality",
        bash_command="echo 'run data_quality_checks.sql'"
    )

    load_raw >> transform_staging >> build_facts_dims >> build_aggs >> data_quality
