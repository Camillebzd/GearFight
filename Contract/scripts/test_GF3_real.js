async function main () {
    const address = '0x6Bd23f240ab250bD86CAF69461e3f26c4Aee6825'; // change after deployement
    const GF = await ethers.getContractFactory('GearFactory_v3');
    const gearF = await GF.attach(address);
    let details = new Object();
    details.name = "Name test 2";
    details.description = "Description test 2";
    details.imageSVG = `<?xml version="1.0" encoding="iso-8859-1"?>
    <svg fill="#000000" height="512px" width="512px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
         viewBox="0 0 454.635 454.635" xml:space="preserve">
    <path d="M286.306,301.929h-17.472L295.141,82.85c0.708-5.89-1.709-13.694-5.621-18.155L236.506,4.255
        C234.134,1.551,230.785,0,227.317,0s-6.816,1.551-9.188,4.255l-53.015,60.439c-3.912,4.461-6.328,12.266-5.621,18.155
        l26.307,219.079h-17.472c-8.412,0-15.256,6.844-15.256,15.256v18.984c0,8.412,6.844,15.256,15.256,15.256h37.118v33.143
        c-10.014,6.95-16.588,18.523-16.588,31.609c0,21.206,17.252,38.458,38.458,38.458s38.458-17.252,38.458-38.458
        c0-13.086-6.574-24.659-16.588-31.609v-33.143h37.118c8.412,0,15.256-6.844,15.256-15.256v-18.984
        C301.562,308.772,294.718,301.929,286.306,301.929z"/>
    </svg>`;
    details.level = 1;
    details.speed = 1;
    details.strenght = 1;
    details.life = 1;
    await gearF.mint(details);
    let test = await gearF.getTokenURI(1);
    console.log("result: ", test);
}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});