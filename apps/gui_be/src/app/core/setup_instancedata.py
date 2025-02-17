"""Make sure the instance_data folder exists and is configured"""

from pathlib import Path
from app.core.config import settings
from app.core.db import init_db
from app.base_logger import logger
import os

### Structure ###
#   instance_data/
#       weights/
#       predictions/
#       models/
#       logs/
#       slurm-cwd/
#           videos/CameraX/0.mp4
#           io.yaml
#       db.sqlite/

make_folders = [
    settings.DATA_FOLDER,
    settings.WEIGHTS_FOLDER,
    settings.CONFIGS_FOLDER,
    settings.VIDEO_FOLDERS_FOLDER,
    settings.LOGS_FOLDER,
    settings.PREDICTIONS_FOLDER,
    settings.SLURM_TRAIN_FOLDER,
    settings.STATIC_TMP_FOLDER,
    settings.RESOURCES_FOLDER,
    settings.JOB_LOGS_FOLDER
]

dummy_io_yaml_text = """# empty io yaml file
# this is a dummy key so that it recognizes the keys
gpu_id: 0
"""


# Create any missing required directories and files
def setup_instancedata(force_recreate=False):
    """
    Make required folders to store instance data and run DANNCE.
    Also create the sqlite3 database (db.sqlite3) if it does not exist.
    """

    if force_recreate is True or not settings.DATA_FOLDER.exists() or not os.listdir(settings.DATA_FOLDER):
        logger.info("CREATING INSTANCE FOLDER")
        # make instance_data folders
        for p in make_folders:
            if not p.exists():
                logger.warning(f"Creating folder: {p}")
                try:
                    p.mkdir(exist_ok=False, mode=0o777)
                except Exception as e:
                    logger.critical(f"Unable to make folder: {p}")
                    raise e

        # set up training folder
        train_folder_videos = Path(settings.SLURM_TRAIN_FOLDER, "videos")
        train_folder_videos.mkdir(mode=0o777, exist_ok=True)

        # TODO: remove after PR changes make this unnecessary
        for i in range(settings.N_CAMERAS):
            # videos/Camera1
            train_folder_camera_i = Path(train_folder_videos, f"Camera{i+1}")
            train_folder_camera_i.mkdir(mode=0o777, exist_ok=True)
            # videos/Camera1/0.mp4
            train_folder_video_i = Path(train_folder_camera_i, "0.mp4")
            train_folder_video_i.touch(mode=0o777, exist_ok=True)

        # make dummy io.yaml file:
        io_yaml_file = Path(settings.SLURM_TRAIN_FOLDER, "io.yaml")
        if not io_yaml_file.exists():
            io_yaml_file.write_text(dummy_io_yaml_text)

        # make empty db.sqlite file
        if not settings.DB_FILE.exists():
            logger.info(f"TRYING TO CREATE DB_FILE at: {settings.DB_FILE}")
            settings.DB_FILE.touch(exist_ok=False)
            logger.warning("INIT'ING DB")
            init_db()
        else:
            logger.info("DB FILE ALREADY EXISTS?")

    else: # not creating local runtime
        logger.info("not recreating local files")
