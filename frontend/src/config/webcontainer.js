import { WebContainer } from '@webcontainer/api';

// minimal placeholder so build passes; replace with your real config later
const webcontainer = { enabled: false, baseUrl: "" };
export default webcontainer;


let webContainerInstance = null;

export const getWebContainer = async () => {
    if (webContainerInstance === null) {
        webContainerInstance = await WebContainer.boot();
    }
    return webContainerInstance;
}


