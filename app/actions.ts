'use server'

const favoriteThings = [
    'Cheesecake',
    'Skiing',
    'Sleeping',
];

export async function getFavoriteThings() {
    return favoriteThings;
}

export async function addFavoriteThing(newThing: string) {
    favoriteThings.push(newThing);
    return;
}