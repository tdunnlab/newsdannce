from app.base_logger import logger
from pathlib import Path
import subprocess

from app.core.config import settings
from app.utils.helpers import make_resource_name


def get_one_frame(
    video_path: str | Path,
    frame_index: int,
    framerate_fps=50,
    output_name: str | Path = None,
) -> str:
    """Extract a single frame from a video using ffmpeg. Return the name of the the file inside the settings.STATIC_TMP_FOLDER"""
    #  if output name is not defined, generte a random (unique) name ending in .png
    if output_name is None:
        output_name = make_resource_name("frame_", ".png")
    output_path = Path(settings.STATIC_TMP_FOLDER, output_name)
    ms_per_frame = 1000 / framerate_fps
    if not ms_per_frame == int(ms_per_frame):
        raise Exception(
            "Framerate not evenly divisible. May result in frame index offset errors"
        )
    timestamp = f"{ms_per_frame*frame_index}ms"

    output = subprocess.run(
        [
            "ffmpeg",
            "-ss",
            timestamp,
            "-i",
            str(video_path),
            "-vframes",
            "1",
            "-an",  # disable audio processing
            str(output_path),  # output path
            "-abort_on",
            "empty_output",
        ],
        capture_output=True,
        text=True,
    )

    try:
        output.check_returncode()
    except subprocess.CalledProcessError as e:
        logger.error("app.util.video.get_one_frame nonzero subprocess output")
        logger.error(f"args.VIDEO PATH: {video_path}")
        logger.error(f"args.FRAME_INDEX: {frame_index}")
        logger.error(f"args.FRAMERATE_FPS: {framerate_fps}")
        logger.error(f"args.OUTPUT_PATH: {output_path}")

        logger.error(f"> stdout: {output.stdout}")
        logger.error(f"> stdout: {output.stderr}")
        raise Exception("Unable to get frame from video")

    return output_name
