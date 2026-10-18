import json
from app.models import Project

def save_project(db, blueprint, user_id):
    project = Project(
        project=blueprint.get("project_name", ""),
        dataset=blueprint.get("dataset", {}).get("name", ""),
        target=blueprint.get("target_column", ""),
        model=blueprint.get("model", {}).get("name", ""),
        blueprint_json=json.dumps(blueprint),
        user_id=user_id
    )
    db.add(project)
    db.commit()
