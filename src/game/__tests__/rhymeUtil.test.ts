import { describe, it, expect } from 'vitest';
import { doesRhyme } from '../rhymeUtil';

describe('doesRhyme', () => {
  it('matches words with same ending sounds', () => {
    expect(doesRhyme('cat', 'hat')).toBe(true);
    expect(doesRhyme('block', 'rock')).toBe(true);
    expect(doesRhyme('cash', 'flash')).toBe(true);
    expect(doesRhyme('street', 'beat')).toBe(true);
    expect(doesRhyme('gold', 'bold')).toBe(true);
  });

  it('does not match the same word', () => {
    expect(doesRhyme('block', 'block')).toBe(false);
    expect(doesRhyme('Cash', 'cash')).toBe(false);
  });

  it('does not match non-rhyming words', () => {
    expect(doesRhyme('block', 'cash')).toBe(false);
    expect(doesRhyme('street', 'gold')).toBe(false);
    expect(doesRhyme('king', 'block')).toBe(false);
  });

  it('is case insensitive', () => {
    expect(doesRhyme('BLOCK', 'rock')).toBe(true);
    expect(doesRhyme('Cash', 'FLASH')).toBe(true);
  });

  it('rejects very short words', () => {
    expect(doesRhyme('a', 'b')).toBe(false);
  });

  it('handles silent-e words correctly', () => {
    expect(doesRhyme('side', 'pride')).toBe(true);
    expect(doesRhyme('ride', 'hide')).toBe(true);
    expect(doesRhyme('make', 'fake')).toBe(true);
    expect(doesRhyme('bone', 'throne')).toBe(true);
    expect(doesRhyme('vibe', 'tribe')).toBe(true);
    expect(doesRhyme('ice', 'dice')).toBe(true);
  });

  it('does not false-match different silent-e sounds', () => {
    expect(doesRhyme('side', 'make')).toBe(false);
    expect(doesRhyme('side', 'bone')).toBe(false);
    expect(doesRhyme('make', 'bone')).toBe(false);
  });

  it('handles long-A spelling variations', () => {
    expect(doesRhyme('reign', 'sane')).toBe(true);
    expect(doesRhyme('reign', 'vein')).toBe(true);
    expect(doesRhyme('rain', 'crane')).toBe(true);
    expect(doesRhyme('pain', 'brain')).toBe(true);
    expect(doesRhyme('chain', 'main')).toBe(true);
    expect(doesRhyme('hate', 'wait')).toBe(true);
    expect(doesRhyme('late', 'weight')).toBe(true);
    expect(doesRhyme('late', 'eight')).toBe(true);
    expect(doesRhyme('game', 'claim')).toBe(true);
    expect(doesRhyme('fame', 'name')).toBe(true);
    expect(doesRhyme('lame', 'fame')).toBe(true);
  });

  it('handles long-A silent-e variations', () => {
    expect(doesRhyme('raid', 'shade')).toBe(true);
    expect(doesRhyme('paid', 'made')).toBe(true);
    expect(doesRhyme('lake', 'break')).toBe(true);
    expect(doesRhyme('tale', 'mail')).toBe(true);
    expect(doesRhyme('cave', 'wave')).toBe(true);
    expect(doesRhyme('blaze', 'days')).toBe(true);
    expect(doesRhyme('craze', 'plays')).toBe(true);
  });

  it('does not cross-match different long-A endings', () => {
    expect(doesRhyme('reign', 'game')).toBe(false);
    expect(doesRhyme('hate', 'rain')).toBe(false);
    expect(doesRhyme('shade', 'hate')).toBe(false);
    expect(doesRhyme('raid', 'rain')).toBe(false);
  });

  it('handles long-E spelling variations', () => {
    expect(doesRhyme('real', 'feel')).toBe(true);
    expect(doesRhyme('deal', 'steel')).toBe(true);
    expect(doesRhyme('clean', 'mean')).toBe(true);
    expect(doesRhyme('green', 'seen')).toBe(true);
    expect(doesRhyme('dream', 'team')).toBe(true);
    expect(doesRhyme('beat', 'street')).toBe(true);
    expect(doesRhyme('scene', 'green')).toBe(true);
  });

  it('handles long-I spelling variations', () => {
    expect(doesRhyme('night', 'fight')).toBe(true);
    expect(doesRhyme('light', 'sight')).toBe(true);
    expect(doesRhyme('fly', 'high')).toBe(true);
    expect(doesRhyme('sign', 'mine')).toBe(true);
    expect(doesRhyme('sign', 'shine')).toBe(true);
    expect(doesRhyme('wise', 'ice')).toBe(true);
    expect(doesRhyme('dice', 'nice')).toBe(true);
    expect(doesRhyme('rice', 'price')).toBe(true);
    expect(doesRhyme('rhyme', 'dime')).toBe(true);
    expect(doesRhyme('rhyme', 'time')).toBe(true);
  });

  it('handles long-O spelling variations', () => {
    expect(doesRhyme('broke', 'smoke')).toBe(true);
    expect(doesRhyme('broke', 'oak')).toBe(true);
    expect(doesRhyme('cloak', 'woke')).toBe(true);
    expect(doesRhyme('bone', 'groan')).toBe(true);
    expect(doesRhyme('throne', 'loan')).toBe(true);
    expect(doesRhyme('stone', 'zone')).toBe(true);
  });

  it('handles OO/ew/ou sound variations', () => {
    expect(doesRhyme('you', 'true')).toBe(true);
    expect(doesRhyme('you', 'crew')).toBe(true);
    expect(doesRhyme('true', 'crew')).toBe(true);
    expect(doesRhyme('blue', 'too')).toBe(true);
  });

  it('handles heart/cart (eart→art)', () => {
    expect(doesRhyme('cart', 'heart')).toBe(true);
    expect(doesRhyme('start', 'heart')).toBe(true);
    expect(doesRhyme('part', 'heart')).toBe(true);
  });

  it('handles irregular ea words (great, break, steak)', () => {
    expect(doesRhyme('great', 'bait')).toBe(true);
    expect(doesRhyme('great', 'hate')).toBe(true);
    expect(doesRhyme('great', 'late')).toBe(true);
    expect(doesRhyme('break', 'fake')).toBe(true);
    expect(doesRhyme('break', 'make')).toBe(true);
    expect(doesRhyme('steak', 'fake')).toBe(true);
    expect(doesRhyme('great', 'beat')).toBe(false);
  });

  it('handles silent-b words', () => {
    expect(doesRhyme('climb', 'dime')).toBe(true);
    expect(doesRhyme('climb', 'time')).toBe(true);
    expect(doesRhyme('climb', 'rhyme')).toBe(true);
    expect(doesRhyme('lamb', 'jam')).toBe(true);
    expect(doesRhyme('thumb', 'drum')).toBe(true);
    expect(doesRhyme('dumb', 'gum')).toBe(true);
    expect(doesRhyme('numb', 'sum')).toBe(true);
  });

  it('does not false-match silent-b across vowel sounds', () => {
    expect(doesRhyme('climb', 'slim')).toBe(false);
  });

  it('treats y as consonant at start of word', () => {
    expect(doesRhyme('yard', 'charred')).toBe(true);
    expect(doesRhyme('yard', 'hard')).toBe(true);
  });

  it('matches single and double trailing consonants', () => {
    expect(doesRhyme('daffodil', 'grill')).toBe(true);
    expect(doesRhyme('hill', 'fill')).toBe(true);
    expect(doesRhyme('buzz', 'fuzz')).toBe(true);
    expect(doesRhyme('pass', 'grass')).toBe(true);
  });
});
