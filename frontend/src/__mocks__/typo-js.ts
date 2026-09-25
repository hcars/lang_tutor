import { vi } from 'vitest';

class MockTypo {
  check = vi.fn((word: string) => {
    const correctWords = ['hello', 'world', 'test', 'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'because', 'but', 'and', 'or', 'if', 'while', 'although', 'though', 'until', 'unless', 'since', 'that', 'which', 'who', 'whom', 'whose', 'what', 'whatever', 'whoever', 'whichever', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'this', 'that', 'these', 'those', 'am', 'about', 'up', 'down'];
    return correctWords.includes(word.toLowerCase());
  });

  suggest = vi.fn((word: string) => {
    const suggestions: Record<string, string[]> = {
      'helo': ['hello', 'help', 'hero'],
      'wrold': ['world', 'word', 'worked'],
      'tset': ['test', 'set', 'text'],
      'teh': ['the', 'tea', 'ten'],
      'adn': ['and', 'add', 'aid'],
      'fo': ['of', 'for', 'go'],
      'nto': ['not', 'to', 'no'],
      'thier': ['their', 'there', 'they'],
      'recieve': ['receive', 'relieve', 'receiver'],
      'occured': ['occurred', 'occurs', 'occur']
    };
    return suggestions[word.toLowerCase()] || [];
  });

  constructor() {}
}

export default MockTypo;
