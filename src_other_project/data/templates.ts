export interface Template {
    id: string;
    nameKey: string;
    items: string[];
}

export const templates: Template[] = [
    {
        id: 'grocery',
        nameKey: 'templates.grocery.name',
        items: [
            'templates.grocery.items.milk',
            'templates.grocery.items.bread',
            'templates.grocery.items.eggs',
            'templates.grocery.items.cheese',
            'templates.grocery.items.butter',
            'templates.grocery.items.coffee',
            'templates.grocery.items.pasta',
            'templates.grocery.items.rice',
            'templates.grocery.items.chicken',
            'templates.grocery.items.vegetables'
        ]
    },
    {
        id: 'gym',
        nameKey: 'templates.gym.name',
        items: [
            'templates.gym.items.water',
            'templates.gym.items.towel',
            'templates.gym.items.shoes',
            'templates.gym.items.headphones',
            'templates.gym.items.lock',
            'templates.gym.items.protein',
            'templates.gym.items.clothes'
        ]
    },
    {
        id: 'travel',
        nameKey: 'templates.travel.name',
        items: [
            'templates.travel.items.passport',
            'templates.travel.items.tickets',
            'templates.travel.items.charger',
            'templates.travel.items.clothes',
            'templates.travel.items.toiletries',
            'templates.travel.items.medication',
            'templates.travel.items.camera'
        ]
    }
];
