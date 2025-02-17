"""Build SBATCH Scripts"""

from pathlib import Path
import shlex

import app.core.db as db
from app.models import RuntimeData
from app.core.config import settings


# internal call - you usually want to use the version which includes defaults
def make_sbatch_str(
    config_path_external,
    sdannce_command: db.JobCommand,
    cwd_folder_external,
    job_name,
    runtime_data: RuntimeData,
    log_file_external: str
):
    # make sure Path objects are strings
    config_path_str = str(config_path_external)
    cwd_folder_str = str(cwd_folder_external)
    log_file_str = str(log_file_external)
    sdannce_img_path_str = str(settings.SDANNCE_IMAGE_PATH)

    sdannce_command_safe = sdannce_command.get_full_command()

    return f"""#!/bin/bash
#SBATCH --mem={shlex.quote(str(runtime_data.memory_gb))}GB
#SBATCH --gres=gpu:1
#SBATCH --time={shlex.quote(str(runtime_data.time_hrs))}:00:00
#SBATCH --cpus-per-task={shlex.quote(str(runtime_data.n_cpus))}
#SBATCH --partition={shlex.quote(runtime_data.partition_list)}
#SBATCH --job-name={shlex.quote(job_name)}
#SBATCH --output={shlex.quote(log_file_str)}

# metadata: runtime name={shlex.quote(runtime_data.name)}

# run from sdannce container
#########
SDANNCE_IMG={shlex.quote(sdannce_img_path_str)}
singularity exec --nv --pwd={shlex.quote(cwd_folder_str)} "$SDANNCE_IMG" dannce {sdannce_command_safe} {shlex.quote(config_path_str)}

"""
