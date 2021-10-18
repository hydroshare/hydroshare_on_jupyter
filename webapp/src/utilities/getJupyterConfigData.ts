export const getJupyterConfigData = async (): Promise<any> => {
  const id = "jupyter-config-data";
  while (!document.getElementById(id)) {
    await new Promise((_) => setTimeout(_, 20));
  }
  let serialized_data = document.getElementById(id)?.textContent!;

  return JSON.parse(serialized_data);
};

export const getBaseUrl = async (): Promise<string> => {
  const configData = await getJupyterConfigData();
  return configData["baseUrl"];
};

export default getJupyterConfigData;
