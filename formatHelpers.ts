export function formatDate(date: Date | string | null | undefined)
{
    if (date === null || date === undefined) 
    {
      return "";
    }

    return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function isNullOrEmptyOrWhitespace(str: string | null | undefined): boolean 
{ 
    //return str === null || str === undefined || str.trim() === '';
     return !str || !str.trim(); 
}  

export function isBracketed(input: string): boolean 
{
    //if (input.length >= 2)
    //{
    //    return input[0] === '[' && input[input.length - 1] === ']';
    //}
    //return false;
    return input.startsWith('[') && input.endsWith(']');
}


    
export function formatMarkdown(inputText: string) 
{
  if (!inputText) {
    return ''; // Return an empty string or any other default value you see fit
  }
    const regexStarBolding = /\*\*(.*?)\*\*/g;
    var inputText1 = inputText.replace(regexStarBolding, (match, p1) => `<strong className='tw-font-bold tw-text-xl tw-font-underline'>${p1}</strong>`);

    const regexBracketLinks = /\[([^\]]+)\]\((http[s]?:\/\/[^\s]+)\)/g;
    var inputText2 = inputText1.replace(regexBracketLinks, "<a href='$2' target='_blank' class='tw-text-blue-500'>$1</a>");

    return inputText2;
}


export function getRandomBoolean() {
    return Math.random() >= 0.5;
  }


export function truncateString(input: string, maxLength: number) {
    if (input.length <= maxLength) {
      return input;
    }
    return input.slice(0, maxLength) + '...';
  }

