import { describe, it, expect } from 'vitest';
import { extractTags, getUniqueTags } from './tags';

describe('tags utility', () => {
    describe('extractTags', () => {
        it('should extract a single tag', () => {
            expect(extractTags('Buy milk #groceries')).toEqual(['#groceries']);
        });

        it('should extract multiple tags', () => {
            expect(extractTags('Finish project #work #urgent')).toEqual(['#work', '#urgent']);
        });

        it('should return empty array if no tags', () => {
            expect(extractTags('Just a normal task')).toEqual([]);
        });

        it('should ignore tags without preceeding space or start of string', () => {
            // "foo#bar" is not a tag, it's a URL hash or something else
            expect(extractTags('Look at this link#section #realTag')).toEqual(['#realTag']);
        });

        it('should match tags at start of string', () => {
            expect(extractTags('#first task')).toEqual(['#first']);
        });

        it('should support unicode characters like Swedish letters', () => {
            expect(extractTags('Clean the house #städa #göra')).toEqual(['#städa', '#göra']);
        });
    });

    describe('getUniqueTags', () => {
        it('should return unique tags sorted alphabetically', () => {
            const items = [
                { text: 'Task 1 #work' },
                { text: 'Task 2 #home #urgent' },
                { text: 'Task 3 #work #home' },
                { text: 'No tags here' }
            ];
            
            expect(getUniqueTags(items)).toEqual(['#home', '#urgent', '#work']);
        });

        it('should be case insensitive when finding uniqueness but return lowercase', () => {
            const items = [
                { text: 'Task 1 #Work' },
                { text: 'Task 2 #work' },
                { text: 'Task 3 #WORK' }
            ];
            
            expect(getUniqueTags(items)).toEqual(['#work']);
        });
    });
});
