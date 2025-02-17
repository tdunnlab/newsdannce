import { BASE_API_URL } from './config';

export function make_url(...segments: string[]) {
  /** Make url from segments: e.g "foo", "bar" => foobar */
  segments = segments.map((x) => x.replace(/\/?(.+?)\/?/, '$1'));
  return segments.join('/');
}

export async function post(
  route: string,
  data: object = {},
  onError?: Function
) {
  const full_url: string = make_url(BASE_API_URL, route);
  const response = await fetch(full_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (response.status >= 200 && response.status < 300) {
    return await response.json();
  }
  if (onError) {
    onError(response);
  }
  throw Error(`Invalid status: ${response.status}`);
}

export async function postFormDataFile(route: string, file: File) {
  const full_url: string = make_url(BASE_API_URL, route);
  const formdata = new FormData();
  formdata.append('file', file);
  const response = await fetch(full_url, {
    method: 'POST',
    body: formdata,
  });
  if (response.status >= 200 && response.status < 300) {
    return await response.json();
  }
  throw Error(`Invalid status: ${response.status}`);
}

export async function get(route: string, query_dict: Record<string, any> = {}) {
  let full_url: string = make_url(BASE_API_URL, route);
  if (query_dict) {
    full_url = `${full_url}?${new URLSearchParams(query_dict)}`;
  }
  const response = await fetch(full_url, {
    method: 'GET',
    headers: {},
  });
  if (response.status >= 200 && response.status < 300) {
    return await response.json();
  }
  throw Error(`Invalid status: ${response.status}`);
}

export async function getFile(route: string) {
  const full_url: string = make_url(BASE_API_URL, route);

  const response = await fetch(full_url, {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
  if (response.status >= 200 && response.status < 300) {
    return await response.text();
  }
  throw Error(`Invalid status: ${response.status}`);
}

export async function delete_verb(route: string, data: object = {}) {
  const full_url: string = make_url(BASE_API_URL, route);
  const response = await fetch(full_url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (response.status >= 200 && response.status < 300) {
    return await response.json();
  }
  throw Error(`Invalid status: ${response.status}`);
}
//  SPECIFIC ROUTES

type CreateRuntimeData = {
  name: string;
  partiton_list: string;
  memory_gb: number;
  time_hrs: number;
  n_cpus: number;
};

export async function createRuntime(data: CreateRuntimeData) {
  post('/runtime/', data);
}

type ListRuntimesData = {
  id: number;
  name: string;
  partition_list: string;
  memory_gb: number;
  time_hrs: number;
  n_cpus: number;
}[];

export async function listRuntimes(): Promise<ListRuntimesData> {
  return get('/runtime/list');
}

type ListVideoFolder = {
  id: number;
  name: string;
  path: string;
  created_at: number;
  com_labels_file?: string;
  dannce_labels_file?: string;
  current_com_prediction?: number;
  status: string;
}[];

export async function listVideoFolders(): Promise<ListVideoFolder> {
  return get('/video_folder/list');
}

type VideoFolderDetails = {
  id: number;
  name: string;
  status: string;
  src_path: string;
  path: string;
  created_at: number;
  com_labels_file?: string;
  dannce_labels_file?: string;
  current_com_prediction_id?: string;
  current_com_prediction_name?: string;

  n_cameras: number;
  n_animals: number;
  n_frames: number;
  duration_s: number;
  video_width: number;
  video_height: number;
  fps: number;
  label_files: {
    n_cameras: number;
    n_frames: number;
    n_joints: number;
    params: {
      K: [
        [number, number, number],
        [number, number, number],
        [number, number, number]
      ];
      r: [
        [number, number, number],
        [number, number, number],
        [number, number, number]
      ];
      t: [[number, number, number]];
      RDistort: [[number, number]];
      TDistort: [[number, number]];
    };
  }[];
  predict_jobs: any[];
  prediction_data: any[];
  path_external: string;
  path_internal: string;
};

export async function videoFolderDetails(
  id: number
): Promise<VideoFolderDetails> {
  if (isNaN(id)) throw new Error('Video folder ID is not a number');
  return get(`/video_folder/${id}`);
}

type MakeVideoFolderData = {
  name: string;
  path: string;
  com_data_file?: string;
  dannce_data_file?: string;
};

export async function makeVideoFolder(
  data: MakeVideoFolderData
): Promise<void> {
  return post('/video_folder/', data);
}

type MakeRuntimeData = {
  name: string;
  partition_list: string;
  memory_gb: number;
  time_hrs: number;
  n_cpus: number;
};

export async function makeRuntime(data: MakeRuntimeData): Promise<void> {
  return post('/runtime/', data);
}

type ListPredictJobsType = {
  predict_job_id: number;
  predict_job_name: string;
  mode: 'COM' | 'DANNCE';
  status: string;
  prediction_id: string;
  prediction_name: string;
  // prediction_path: string;
  weights_id: string;
  weights_name: string;
  // weights_path: string;
  video_folder_id: number;
  video_folder_name: string;
  // video_folder_path: string;
  slurm_status: string;
  local_status: string;
  slurm_job_id: number;
  local_process_id: number;
  runtime_type: 'LOCAL' | 'SLURM';
  runtime_id: number;
  runtime_name: string;
  created_at: number;
  log_path_external: string | null;
}[];

export async function listPredictJobs(): Promise<ListPredictJobsType> {
  return get('/predict_job/list');
}

type ListTrainJobsType = {
  slurm_job_id: number;
  log_path_external: string | null;
  mode: 'COM' | 'DANNCE';
  status: string;
  train_job_id: number;
  train_job_name: string;
  runtime_id: number;
  runtime_name: string;
  weights_id: number;
  weights_name: string;
  // weights_path: string;
  local_process_id: number;
  runtime_type: 'LOCAL' | 'SLURM';
  slurm_status: string;
  local_status: string;
  created_at: number;
}[];

export async function listTrainJobs(): Promise<ListTrainJobsType> {
  console.log('FETCHING TRAINING JOBS TODO: REMOVE');
  return get('/train_job/list');
}

type ListPredictionsType = {
  prediction_name: string;
  prediction_id: number;
  prediction_path: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  video_folder_id: number;
  mode: 'COM' | 'DANNCE';
  created_at: number;
}[];
export async function listPredictions(): Promise<ListPredictionsType> {
  return get('/prediction/list');
}

type SubmitComTrainJobData = {
  name: string;
  video_folder_ids: number[];
  output_model_name: string;
  config: string;
  epochs: number;
  vol_size: number;
  runtime_id: number;
};

export async function submitComTrainJob(
  data: SubmitComTrainJobData
): Promise<void> {
  return post('/train_job/submit_com', data);
}

type SubmitDannceTrainJobData = {
  name: string;
  video_folder_ids: number[];
  output_model_name: string;
  config: string;
  epochs: number;
  runtime_id: number;
};

export async function submitDannceTrainJob(
  data: SubmitDannceTrainJobData
): Promise<void> {
  return post('/train_job/submit_dannce', data);
}

type SubmitComPredictJobData = {
  name: string;
  prediction_name: string;
  video_folder_id: number;
  weights_id: number;
  config: string;
  runtime_id: number;
};

export async function submitComPredictJob(
  data: SubmitComPredictJobData
): Promise<void> {
  return post('/predict_job/submit_com', data);
}

type SubmitDanncePredictJobData = {
  name: string;
  prediction_name: string;
  video_folder_id: number;
  weights_id: number;
  config: string;
  runtime_id: number;
};

export async function submitDanncePredictJob(
  data: SubmitDanncePredictJobData
): Promise<void> {
  return post('/predict_job/submit_dannce', data);
}

export async function refreshJobs(): Promise<void> {
  return post('/jobs_common/update_live_jobs', {});
}

type PredictJobDetailsType = {
  name: string;
  weights_id: number;
  weights_path: string;
  weights_status: 'PENDING' | 'COMPLETED' | 'FAILED';
  config: object;
  mode: 'DANNCE' | 'COM';
  video_folder_id: number;
  video_folder_name: string;
  video_folder_path: string;
  prediction_id: number;
  prediction_name: string;
  prediction_path: string;
  runtime_id: number;
  runtime_name: string;
  gpu_job_id: number;
  runtime_type: 'LOCAL' | 'SLURM';
  slurm_status: string;
  local_status: string;
  slurm_job_id: number;
  local_job_id: number;
  log_path: string;
  log_path_external: string;
};
export async function getPredictJobDetails(
  predictJobId: number
): Promise<PredictJobDetailsType> {
  return get(`/predict_job/${predictJobId}`);
}

type TrainJobDetailsType = {
  name: string;
  weights_id: number;
  weights_path: string;
  weights_status: 'PENDING' | 'COMPLETED' | 'FAILED';
  config: object;
  mode: 'DANNCE' | 'COM';
  video_folders: {
    id: number;
    name: string;
    path: string;
  }[];
  runtime_id: number;
  runtime_name: string;
  gpu_job_id: number;
  runtime_type: 'LOCAL' | 'SLURM';
  slurm_status: string;
  local_status: string;
  slurm_job_id: number;
  local_job_id: number;
  log_path: string;
  log_path_external: string;
};
export async function getTrainJobDetails(
  trainJobId: number
): Promise<TrainJobDetailsType> {
  return get(`/train_job/${trainJobId}`);
}

type ListWeightsData = {
  id: number;
  name: string;
  path: string;
  status: 'COMPLETED' | 'FAILED' | 'PENDING';
  mode: 'COM' | 'DANNCE';
  created_at: number;
}[];

export async function listWeights(): Promise<ListWeightsData> {
  return get('/weights/list');
}

export async function getGpuJobLogFile(gpuJobId: number): Promise<any> {
  if (!gpuJobId) {
    throw Error('getSlurmLogFIle:: slurmJobId must be defined');
  }
  return getFile(`/jobs_common/get_log/${gpuJobId}`);
}

export async function getComPreview(
  predictionId: number,
  nSamples: number
): Promise<number[][]> {
  if (!predictionId) {
    throw Error('getComPreview:: predictionId must be defined');
  }
  return get(`/prediction/${predictionId}/com_preview`, { samples: nSamples });
}

type ComHistogramReturnType = {
  hist: number[];
  bin_edges: number[];
};
export async function getComHistogram(
  predictionId: number
): Promise<ComHistogramReturnType> {
  if (!predictionId) {
    throw Error('getComPreview:: predictionId must be defined');
  }
  return get(`/prediction/${predictionId}/com_histogram`);
}

export async function getSkeletonPath(): Promise<{ data: null | string }> {
  return get(`/settings_page/skeleton`);
}

type ImportVideoFoldersType = {
  paths: string[];
};
export async function importVideoFolders(
  data: ImportVideoFoldersType
): Promise<any> {
  if (data.paths.length == 0) {
    throw Error('importVideoFolders:: paths[] must not be empty');
  }

  return post('/video_folder/import_from_paths', data);
}

export type PredictionDetailsType = {
  prediction_id: number;
  prediction_name: string;
  prediction_path: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  video_folder_id: number;
  mode: 'DANNCE' | 'SDANNCE' | 'COM';
  n_frames: number;
  n_joints: number;
  created_at: number;
  path_internal: string;
  path_external: string;
};
export async function getPredictionDetails(
  predictionId: number
): Promise<PredictionDetailsType> {
  if (!predictionId) {
    throw Error('getPredictionDetails:: predictionId must be defined');
  }
  return get(`/prediction/${predictionId}`);
}

export type WeightsDetailsType = {
  weights_id: number;
  weights_name: string;
  weights_path: string;
  weights_status: 'PENDING' | 'COMPLETED' | 'FAILED';
  mode: 'DANNCE' | 'SDANNCE' | 'COM';
  created_at: number;
  path_internal: string;
  path_external: string;
};
export async function getWeightsDetails(
  predictionId: number
): Promise<WeightsDetailsType> {
  if (!predictionId) {
    throw Error('getWeightsDetails:: weightsId must be defined');
  }
  return get(`/weights/${predictionId}`);
}

export type PreviewPredictionType = {
  frames: {
    frame_idx: number;
    absolute_frameno: number; // frame number of the within the original video (not frame idx)
    static_url_cam1: string;
    static_url_cam2: string;
    pts_cam1: number[][];
    pts_cam2: number[][];
  }[];
  n_frames: number;
  frame_width: number;
  frame_height: number;
  n_joints: number;
  skeleton_data?: {
    joint_names: string[];
    joints_idx: number[][];
  };
};
export async function previewPrediction(
  predictionId: number,
  frames: number[],
  camera_name_1: string,
  camera_name_2: string
): Promise<PreviewPredictionType> {
  if (!predictionId) {
    throw Error('getPredictionDetails:: predictionId must be defined');
  }
  return post(`/prediction/${predictionId}/make_preview`, {
    frames: frames,
    camera_name_1: camera_name_1,
    camera_name_2: camera_name_2,
  });
}
