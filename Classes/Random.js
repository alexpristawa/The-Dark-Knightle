class Random {
    static random(seed) {
        // Hashing the seed
        seed *= 1.1;
        seed = Math.sin(seed**5);
        seed = Math.cos(seed**2);
        seed = Math.abs(Math.sin(Math.tan(seed**6*19)**3));
        return seed;
    }
}