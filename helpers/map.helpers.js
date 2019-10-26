export const reviewToArticles = (review) => {
    let totalToPush = null;
    const summary = review.reduce((previous,current)=>{
        if(current.isItem){
            totalToPush={...current};
        }else{
            totalToPush.qtyVariance=current.qtyVariance;
            previous.push(totalToPush);
        }
        return previous;
    },[]);
    
    const articles = new Map();
    for (let item of summary) {
        if ( Number(item.qtyVariance)<0 || item.qtyVariance.substring(item.qtyVariance.length-1)==='-') {
            articles.set(item.key, { ...item });
        }
    }
    return articles;
}