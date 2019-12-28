import Realm from 'realm';

export const initCyclicCount = () => {
    return Realm.open({ schema: [ArticleSchema, CyclicCountSchema] });
}

export const listCyclicCounts = (realm, businessUnit) => {
    const counts = realm.objects('count');
    const countsForBusinessUnit = counts.filtered('businessUnit = $0 ', businessUnit);
    return countsForBusinessUnit;
}

export const insertCyclicCount = (realm, cyclicCount) => {
    const counts = realm.objects('count');
    const search = counts.filtered('key = $0 ', cyclicCount.key);

    if (search.length === 0) {
        realm.write(() => {
            const offlineCyclicCount = realm.create('count', {
                ...cyclicCount,
                whoCountsSignature: "",
                whoCountsSignatureTxt: "",
                whoAutorizeSignature: "",
                whoAutorizeSignatureTxt: "",
                articles: [...cyclicCount.articles.values()],
                needsSyncronize: false

            });

          

        });


    }


}

export const updateCyclicCountArticles = (realm, countNumber, articles) => {

    const counts = realm.objects('count');
    const search = counts.filtered('key = $0 ', countNumber);
    if (search.length) {
        realm.write(() => {

            const cyclicCount = search[0];
            articles.forEach(article=>{
                cyclicCount.articles.find(item=>item.key===article.key).qty = Number(article.qty);
            });          
            cyclicCount.needsSyncronize = true;

        });
    }

}

export const updateCyclicCountSignatures = (realm,countNumber,signatureType,signature,signatureTxt) => {

    const counts = realm.objects('count');
    const search = counts.filtered('key = $0 ', countNumber);
    if (search.length) {
        realm.write(() => {

            const cyclicCount = search[0];
            switch(signatureType){
                case 'cuenta':
                    cyclicCount.whoCountsSignature = signature;
                    cyclicCount.whoCountsSignatureTxt = signatureTxt;
                    break;
                case 'autoriza':
                    cyclicCount.whoAutorizeSignature = signature;
                    cyclicCount.whoAutorizeSignatureTxt = signatureTxt;
                    break;
                default:                    
                    cyclicCount.whoCountsSignature = signature;
                    cyclicCount.whoCountsSignatureTxt = signatureTxt;
                    break;
        
            }  
            cyclicCount.needsSyncronize = true;

        });
    }
   

}


export const deleteCyclicCount = (realm,countNumber) => {
    realm.write(()=>{
        
        const counts = realm.objects('count');
        const search = counts.filtered('key = $0 ', countNumber);
        if(search.length){
            realm.delete(search[0].articles)
        }
        realm.delete(search);

    });
    
}


const CyclicCountSchema = {
    name: 'count',
    primaryKey: 'key',
    properties: {
        key: 'string',
        number: 'string',
        description: 'string',
        businessUnit: "int",
        whoCountsSignature: "string",
        whoCountsSignatureTxt: "string",
        whoAutorizeSignature: "string",
        whoAutorizeSignatureTxt: "string",
        articles: "article[]",
        needsSyncronize: "bool",
    }
}
const ArticleSchema = {
    name: 'article',
    primaryKey: 'key',
    properties: {
        key: 'string',
        serial: 'string',
        description: 'string',
        location: "string",
        um: "string",
        itemNumber: "string",
        rowId: "int",
        qty: "int",

    }
}




