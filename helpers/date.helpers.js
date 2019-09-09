export const dateToEnglishString=(date)=>{
    let dia = date.getDate();
    dia = (dia<10?"0":"") + dia;
    let mes = date.getMonth() +1 ;
    mes = (mes<10?"0":"") + mes;
    return   `${mes}/${dia}/${date.getFullYear()}`
}
export const dateToLatinString=(date)=>{
    let dia = date.getDate();
    dia = (dia<10?"0":"") + dia;
    let mes = date.getMonth() +1 ;
    mes = (mes<10?"0":"") + mes;
    return   `${dia}/${mes}/${date.getFullYear()}`
}
