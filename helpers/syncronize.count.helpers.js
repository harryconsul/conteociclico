import {enterCyclicCount} from '../apicalls/count.operations';
import {uploadSignature} from '../apicalls/signature.uploads';


export const  uploadCount = (token,stack,cyclicCountNumber,articles,whoCountsSign,whoCountsTxt,whoAuthorizeSign,whoAuthorizeTxt,callback)=>{
    let enterCountReponse=null;
    const uploadSignatures = (reponse)=>{
        enterCountReponse = reponse;
        uploadSignature(cyclicCountNumber,whoCountsSign,token,whoCountsTxt,()=>
            uploadSignature(cyclicCountNumber,whoAuthorizeSign,token,whoAuthorizeTxt,()=>callback(enterCountReponse),null,null),null,null);
    }

    enterCyclicCount(token,stack,articles,uploadSignatures);

    
};

