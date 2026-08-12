// TASK Z

// Shunday function yozing. Bu function sonlardan iborat array
// qabul qilsin. Function'ning vazifasi array tarkibidagi juft
// sonlarni topib ularni yig'disini qaytarsin.

// MASALAN:
// sumEvens([1, 2, 3]); return 2;
// sumEvens([1, 2, 3, 2]); return 4;

// Yuqoridagi misolda, bizning funktsiya
// berilayotgan array tarkibidagi sonlar ichidan faqatgina juft bo'lgan
// sonlarni topib, ularni hisoblab yig'indisini qaytarmoqda.

function sumEvens(arr: number[]) {
  return arr
    .filter((val) => val % 2 === 0)
    .reduce((sum, current) => sum + current, 0);
}

console.log(sumEvens([1, 2, 3]));

console.log(sumEvens([1, 2, 3, 2]));

// TASK Y

// Shunday function yozing, uni 2'ta array parametri bo'lsin.
// Bu function ikkala arrayda ham ishtirok etgan bir xil
// qiymatlarni yagona arrayga joylab qaytarsin.

// MASALAN: findIntersection([1,2,3], [3,2,0]) return [2,3]

// Yuqoridagi misolda, argument sifatida berilayotgan array'larda
// o'xshash sonlar mavjud. Function'ning vazifasi esa ana shu
// ikkala array'da ishtirok etgan o'xshash sonlarni yagona arrayga
// joylab return qilmoqda.

// function findIntersection(arr1: number[], arr2: number[]): number[] {
//   const interSectionArr: number[] = [];
//   for (let num of arr1) {
//     for (let num2 of arr2) {
//       if (num2 === num) {
//         interSectionArr.push(num2);
//       }
//     }
//   }
//   return interSectionArr;
// }

// console.log(findIntersection([1, 2, 3], [3, 2, 0]));

// TASK X

// Shunday function yozing, uni object va string parametrlari bo'lsin.
// Bu function, birinchi object parametri tarkibida, kalit sifatida ikkinchi string parametri
// necha marotaba takrorlanganlini sanab qaytarsin.

// Eslatma => Nested object'lar ham sanalsin

// MASALAN: countOccurrences({model: 'Bugatti', steer: {model: 'HANKOOK', size: 30}}, 'model') return 2

// Yuqoridagi misolda, birinchi argument object, ikkinchi argument 'model'.
// Funktsiya, shu ikkinchi argument 'model', birinchi argument object
// tarkibida kalit sifatida 2 marotaba takrorlanganligi uchun 2 soni return qilmoqda

// function countOccurrences(obj, text) {
//   let counter = 0;
//   for (const [key, value] of Object.entries(obj)) {
//     if (key === text) {
//       counter += 1;
//     }
//     if (value === text) {
//       counter += 1;
//     }
//     if (typeof value === "object") {
//       for (const [key, value] of Object.entries(obj)) {
//         if (key === text) {
//           counter += 1;
//         }
//         if (value === text) {
//           counter += 1;
//         }
//       }
//     }
//   }
//   return counter;
// }

// console.log(
//   countOccurrences(
//     { model: "Bugatti", steer: { model: "HANKOOK", size: 30 } },
//     "model",
//   ),
// );

// TASK W

// Shunday function yozing, u o'ziga parametr sifatida
// yagona array va number qabul qilsin. Siz tuzgan function
// arrayni numberda berilgan uzunlikda kesib bo'laklarga
// ajratgan holatida qaytarsin.
// MASALAN: chunkArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3);
// return [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]];

// Yuqoridagi namunada berilayotgan array ikkinchi parametr 3'ga
// asoslanib 3 bo'lakga bo'linib qaytmoqda. Qolgani esa o'z holati qolyapti

// function chunkArray(arr: number[], chunk: number) {
//   const result = [];
//   for (let i = 0; i < arr.length; i+=chunk) {
//     result.push(arr.slice(i, i+chunk));
//   }
//   return result
// }

// console.log(chunkArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3));

// TASK V

// Shunday function yozing, uni string parametri bo'lsin.
// Va bu function stringdagi har bir harfni o'zi bilan
// necha marotaba taktorlanganligini ko'rsatuvchi object qaytarsin.

// MASALAN: countChars("hello") return {h: 1, e: 1, l: 2, o: 1}

// Yuqoridagi misolda, 'hello' so'zi tarkibida
// qatnashgan harflar necha marotaba takrorlangini bilan
// object sifatida qaytarilmoqda.

// function countChars(text: string){
//   const obj: Record<string, number> = {}
//   for(let char of text){
//     if(obj[char]){
//       obj[char]++
//     }else{
//       obj[char] = 1
//     }
//   }
//   return obj
// }

// console.log(countChars("hello"))

// TASK U

// Shunday function tuzing, uni number parametri bo'lsin.
// Va bu function berilgan parametrgacha, 0'dan boshlab
// oraliqda nechta toq sonlar borligini aniqlab return qilsin.

// MASALAN: sumOdds(9) return 4; sumOdds(11) return 5;

// Yuqoridagi birinchi misolda, argument sifatida, 9 berilmoqda.
// Va 0'dan boshlab sanaganda 9'gacha 4'ta toq son mavjud.
// Keyingi namunada ham xuddi shunday xolat takrorlanmoqda.

// function sumOdds(num: number) {
//   let odds = 0;
//   for (let i = 0; i < num; i++) {
//     if (i % 2 === 1) {
//       odds += 1;
//     }
//   }
//   return odds;
// }

// console.log(sumOdds(9));
// TASK T

// Shunday function tuzing, u sonlardan tashkil topgan 2'ta array qabul qilsin.
// Va ikkala arraydagi sonlarni tartiblab bir arrayda qaytarsin.

// MASALAN: mergeSortedArrays([0, 3, 4, 31], [4, 6, 30]); return [0, 3, 4, 4, 6, 30, 31];

// Yuqoridagi misolda, ikkala arrayni birlashtirib, tartib raqam bo'yicha tartiblab qaytarmoqda.

// function mergeSortedArrays(arr1: number[], arr2: number[]): number[] {
//   return [...arr1, ...arr2].sort((a, b) => a - b);
// }

// console.log(mergeSortedArrays([0, 3, 4, 31], [4, 6, 30]));

// S-TASK

// Shunday function yozing, u numberlardan tashkil topgan list qabul qilsin
//  va osha numberlar orasidagi tushib qolgan sonni topib uni return qilsin
// MASALAN: missing_number([3, 0, 1]) return 2

// function missing_number(list: number[]): number {
//   const n = list.length;

//   const expected = (n * (n + 1)) / 2;

//   const actual = list.reduce((sum, num) => sum + num, 0);

//   return expected - actual;
// }

// console.log(missing_number([3, 0, 1]));

// R-TASK

// Shunday function yozing, u string parametrga ega bolsin.
// String "1+2" holatda pass qilinganda string ichidagi sonlar yigindisini number holatda qaytarsin.
// MASALAN: calculate("1+3") return 4;

// function calculate(str: string){
//   const a = Number(str.split("")[0])
//   const b = Number(str.split("")[2])
//   return a+b
// }
// console.log(calculate("1+3") )

// // TASK Q:

// // Shunday function yozing, u 2 ta parametrga ega bo'lib
// // birinchisi object, ikkinchisi string bo'lsin.
// // Agar qabul qilinayotgan ikkinchi string, objectning
// // // biror bir propertysiga mos kelsa, 'true', aks holda mos kelmasa 'false' qaytarsin.

// // MASALAN: hasProperty({ name: "BMW", model: "M3" }, "model"); return true;
// // Ushbu misolda, 'model' string, objectning propertysiga mos kelganligi uchun 'true' natijani qaytarmoqda

// function hasProperty(obj: any, key: string): boolean {
//   return key in obj;
// }

// const result = hasProperty({ name: "BMW", model: "M3" }, "model");
// console.log(result);
