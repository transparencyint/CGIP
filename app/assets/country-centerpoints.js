/*
Country center points generated from jquery.vmap.world.js

var svgMap = {
  dimensions: {
    width: $('svg').width(),
    height: $('svg').height()
  },
  centers: {}
};

$('path').each(function(i,path){
  var pos = path.getBoundingClientRect();
  var name = path.id.slice(-2);

  svgMap.centers[name] = {
    x: pos.left + pos.width/2,
    y: pos.top + pos.height/2
  }
});
*/
var centerpoints = {"dimensions":{"width":1400,"height":800},"centers":{"id":{"x":1153.8472900390625,"y":461.5745391845703},"pg":{"x":1278.8072509765625,"y":489.14549255371094},"mx":{"x":264.4072799682617,"y":334.30909729003906},"ee":{"x":752.603759765625,"y":172.8763885498047},"dz":{"x":676.1600341796875,"y":328.88368225097656},"ma":{"x":631.0255126953125,"y":328.5563507080078},"mr":{"x":622.8945617675781,"y":361.9891357421875},"sn":{"x":610.6327209472656,"y":390.30908203125},"gm":{"x":606.0291137695312,"y":392.9854278564453},"gw":{"x":607.3236694335938,"y":402.27996826171875},"gn":{"x":620.1382141113281,"y":408.4690856933594},"sl":{"x":618.2109069824219,"y":415.9745330810547},"lr":{"x":628.2327880859375,"y":424.9781951904297},"ci":{"x":645.6290893554688,"y":420.4691162109375},"ml":{"x":652.3563537597656,"y":375.8800354003906},"bf":{"x":662.7854919433594,"y":397.5600128173828},"ne":{"x":702.4290771484375,"y":374.25091552734375},"gh":{"x":662.7345581054688,"y":417.6617889404297},"tg":{"x":673.003662109375,"y":415.55271911621094},"bj":{"x":678.5745239257812,"y":411.53819274902344},"ng":{"x":703.4400329589844,"y":412.7381591796875},"tn":{"x":707.2945861816406,"y":302.5782012939453},"ly":{"x":737.5926513671875,"y":336.28001403808594},"eg":{"x":789.1781616210938,"y":333.8145751953125},"td":{"x":743.3890991210938,"y":385.0581970214844},"sd":{"x":791.8036804199219,"y":392.9491424560547},"cm":{"x":720.1672973632812,"y":419.53814697265625},"er":{"x":830.3709716796875,"y":384.2945556640625},"dj":{"x":842.4290771484375,"y":398.20726013183594},"et":{"x":835.054443359375,"y":412.28001403808594},"so":{"x":857.8690185546875,"y":427.6472930908203},"ye":{"x":865.5708923339844,"y":383.1309356689453},"cf":{"x":755.5927124023438,"y":421.28363037109375},"st":{"x":697.1636352539062,"y":447.589111328125},"gq":{"x":708.6182250976562,"y":440.0327606201172},"ga":{"x":715.9708862304688,"y":455.77093505859375},"cg":{"x":729.5709533691406,"y":453.8727264404297},"ao":{"x":740.669189453125,"y":497.96002197265625},"cd":{"x":759.2945861816406,"y":469.036376953125},"rw":{"x":792.2036743164062,"y":457.3636169433594},"bi":{"x":792.0073547363281,"y":465.8509063720703},"ug":{"x":802.3855590820312,"y":445.37818908691406},"ke":{"x":824.5163879394531,"y":448.4981689453125},"tz":{"x":812.9236450195312,"y":476.74546813964844},"zm":{"x":781.4181823730469,"y":507.0290832519531},"mw":{"x":810.4072570800781,"y":508.2582092285156},"mz":{"x":814.6981506347656,"y":530.3600463867188},"zw":{"x":786.9817810058594,"y":531.865478515625},"na":{"x":742.320068359375,"y":550.0108642578125},"bw":{"x":766.6181945800781,"y":547.2836608886719},"sz":{"x":795.1126708984375,"y":564.9054870605469},"ls":{"x":780.1163330078125,"y":578.9273071289062},"za":{"x":765.9053955078125,"y":575.6546020507812},"gl":{"x":559.4473266601562,"y":82.85454559326172},"au":{"x":1192.8945922851562,"y":605.9309387207031},"nz":{"x":1316.2182006835938,"y":697.4654541015625},"nc":{"x":1332.7418823242188,"y":577.34912109375},"my":{"x":1117.17822265625,"y":431.1963806152344},"bn":{"x":1141.7964477539062,"y":426.44000244140625},"tl":{"x":1181.6510009765625,"y":498.77459716796875},"sb":{"x":1321.4617919921875,"y":505.64727783203125},"vu":{"x":1350.8655395507812,"y":550.6872863769531},"fj":{"x":1388.0000610351562,"y":562.3236694335938},"ph":{"x":1168.8146362304688,"y":387.9964141845703},"cn":{"x":1052.6112060546875,"y":261.9891586303711},"tw":{"x":1151.840087890625,"y":328.5127258300781},"jp":{"x":1195.1636352539062,"y":242.760009765625},"ru":{"x":1009.1782531738281,"y":113.17454147338867},"us":{"x":216.16726303100586,"y":184.08361053466797},"mu":{"x":901.0763854980469,"y":542.3600158691406},"re":{"x":891.7817993164062,"y":546.0472717285156},"mg":{"x":860.2327270507812,"y":531.2036743164062},"km":{"x":853.3527526855469,"y":502.3236389160156},"sc":{"x":892.6473083496094,"y":475.4291076660156},"mv":{"x":966.9600219726562,"y":435.7054901123047},"pt":{"x":595.79638671875,"y":286.5636444091797},"es":{"x":639.0182189941406,"y":293.5091094970703},"cv":{"x":576.1091003417969,"y":387.8072967529297},"pf":{"x":53.469093322753906,"y":549.0945434570312},"kn":{"x":410.90184020996094,"y":372.5927276611328},"ag":{"x":415.4618377685547,"y":375.763671875},"dm":{"x":419.4982147216797,"y":382.7382049560547},"lc":{"x":420.1382141113281,"y":388.6800231933594},"bb":{"x":419.447265625,"y":394.17822265625},"gd":{"x":417.18548583984375,"y":398.621826171875},"tt":{"x":418.9745635986328,"y":405.61094665527344},"do":{"x":385.5199890136719,"y":366.2363739013672},"ht":{"x":373.7891082763672,"y":365.1163787841797},"fk":{"x":457.1272888183594,"y":700.4109497070312},"is":{"x":607.0182189941406,"y":138.9345474243164},"no":{"x":723.6364440917969,"y":102.6072769165039},"lk":{"x":1002.1964111328125,"y":414.2872772216797},"cu":{"x":349.7382049560547,"y":353.21095275878906},"bs":{"x":363.15638732910156,"y":337.12364196777344},"jm":{"x":355.5709228515625,"y":367.87274169921875},"ec":{"x":346.36366271972656,"y":460.5054473876953},"ca":{"x":352.2326965332031,"y":117.50181579589844},"gt":{"x":301.2145538330078,"y":378.92724609375},"hn":{"x":317.4836730957031,"y":386.6363830566406},"sv":{"x":305.81817626953125,"y":389.5745391845703},"ni":{"x":321.12730407714844,"y":392.7672576904297},"cr":{"x":322.2836456298828,"y":408.57823181152344},"pa":{"x":340.86546325683594,"y":412.6581726074219},"co":{"x":367.49818420410156,"y":432.8618621826172},"ve":{"x":396.4217987060547,"y":423.7418518066406},"gy":{"x":426.87998962402344,"y":431.88731384277344},"sr":{"x":439.2509765625,"y":434.9563903808594},"gf":{"x":451.6654968261719,"y":435.16725158691406},"pe":{"x":361.24363708496094,"y":495.55274963378906},"bo":{"x":410.66184997558594,"y":526.0036926269531},"py":{"x":435.3600158691406,"y":557.2981872558594},"uy":{"x":454.2545623779297,"y":598.7818298339844},"ar":{"x":424.0436553955078,"y":637},"cl":{"x":406.53089904785156,"y":628.4254455566406},"br":{"x":446.6473083496094,"y":514.6000366210938},"bz":{"x":309.2509002685547,"y":371.1890869140625},"mn":{"x":1046.8799743652344,"y":211.96001434326172},"kp":{"x":1149.2728881835938,"y":236.97821044921875},"kr":{"x":1158.6763916015625,"y":258.98545837402344},"kz":{"x":910.3928833007812,"y":220.31637573242188},"tm":{"x":894.2327270507812,"y":271.7490997314453},"uz":{"x":909.6873168945312,"y":259.07273864746094},"tj":{"x":940.5454406738281,"y":269.05088806152344},"kg":{"x":949.2727355957031,"y":255.61090087890625},"af":{"x":927.5272827148438,"y":296.8036651611328},"pk":{"x":941.3599243164062,"y":310.0327606201172},"in":{"x":996.6036071777344,"y":351.82916259765625},"np":{"x":1000.9964294433594,"y":317.5600280761719},"bt":{"x":1025.5200805664062,"y":320.87635803222656},"bd":{"x":1028.9091796875,"y":339.65455627441406},"mm":{"x":1055.3963623046875,"y":357.57452392578125},"th":{"x":1078.0074462890625,"y":387.4073028564453},"kh":{"x":1094.6400146484375,"y":390.3745422363281},"la":{"x":1088.3709716796875,"y":361.9236602783203},"vn":{"x":1096.4218139648438,"y":373.0873260498047},"ge":{"x":828.1237487792969,"y":259.34912109375},"am":{"x":838.1890869140625,"y":270.0472717285156},"az":{"x":848.3272705078125,"y":268.5563659667969},"ir":{"x":877.010986328125,"y":305.4291076660156},"tr":{"x":800.7710266113281,"y":277.4581756591797},"om":{"x":893.760009765625,"y":358.7381591796875},"ae":{"x":883.1709594726562,"y":342.8472900390625},"qa":{"x":872.8581848144531,"y":338.8909454345703},"kw":{"x":854.7417907714844,"y":321.18182373046875},"sa":{"x":847.4618225097656,"y":344.6291198730469},"sy":{"x":816.1673278808594,"y":297.1309051513672},"iq":{"x":838.5018005371094,"y":303.3708953857422},"jo":{"x":810.8145446777344,"y":314.77455139160156},"lb":{"x":804.6400146484375,"y":300.84002685546875},"il":{"x":803.1854553222656,"y":313.31272888183594},"cy":{"x":795.9273071289062,"y":296.58546447753906},"gb":{"x":657.9855041503906,"y":199.37821197509766},"ie":{"x":638.6473083496094,"y":204.15638732910156},"se":{"x":725.7527465820312,"y":152.3454360961914},"fi":{"x":753.0545654296875,"y":133.59636688232422},"lv":{"x":759.3017883300781,"y":183.16727447509766},"lt":{"x":750.3054504394531,"y":191.82909393310547},"by":{"x":767.3236389160156,"y":200.49090576171875},"pl":{"x":737.5418395996094,"y":210.6654815673828},"it":{"x":716.2763977050781,"y":264.5563507080078},"fr":{"x":678.5018615722656,"y":242.91273498535156},"nl":{"x":687.7891540527344,"y":210.92727661132812},"be":{"x":686.0872802734375,"y":220.5636444091797},"de":{"x":707.0764770507812,"y":217.50910186767578},"dk":{"x":703.6000366210938,"y":188.4618377685547},"ch":{"x":698.7491455078125,"y":239.76365661621094},"cz":{"x":724.6908874511719,"y":224.0109405517578},"sk":{"x":740.5309448242188,"y":229.61819458007812},"at":{"x":718.7418212890625,"y":234.89822387695312},"hu":{"x":741.280029296875,"y":236.85458374023438},"si":{"x":723.5418395996094,"y":242.14183044433594},"hr":{"x":728.9237365722656,"y":252.0836639404297},"ba":{"x":734.930908203125,"y":253.74911499023438},"mt":{"x":724.8072509765625,"y":296.1854705810547},"ua":{"x":782.6181335449219,"y":228.05455780029297},"md":{"x":771.3309020996094,"y":236.34548950195312},"ro":{"x":761.9563598632812,"y":243.19638061523438},"rs":{"x":745.214599609375,"y":252.5345458984375},"bg":{"x":763.0255126953125,"y":259.5236511230469},"al":{"x":745.0473022460938,"y":267.98182678222656},"mk":{"x":750.9454956054688,"y":265.1818084716797},"gr":{"x":758.2909851074219,"y":281.4872741699219}}}