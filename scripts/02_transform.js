// 1. Створити нову колекцію tracks
// Використовуйте базу spotify.
// Перед трансформацією видаліть стару колекцію tracks, якщо вона існує.

db = db.getSiblingDB("spotify");
const TARGET_COLLECTION = "tracks";
const SOURCE_COLLECTION = "tracks_raw";
db[TARGET_COLLECTION].drop();


db[SOURCE_COLLECTION].aggregate([
    
    // 2. Проєкція полів
    // Залиште лише потрібні поля для аналізу:track_id, track_name, album_name, explicit, popularity, duration_ms, track_genre та рядок із артистами (artists_raw).
    {
        $project: {
            _id: 0,
            track_id: 1,
            track_name: 1,
            album_name: 1,
            explicit: 1,
            popularity: 1,
            duration_ms: 1,
            track_genre: 1,
            artists_raw: "$artists",
            danceability: 1, 
            energy: 1, 
            loudness: 1, 
            speechiness: 1, 
            acousticness: 1, 
            instrumentalness: 1, 
            liveness: 1, 
            valence: 1, 
            tempo: 1, 
            key: 1, 
            mode: 1, 
            time_signature: 1
        }
    },

    // 3. Перетворення артистів
    // Розбийте рядок артистів по ; та приберіть пробіли навколо кожного імені.
    // Збережіть результат у полі artists як масив.
    {
        $addFields: {
            artists: {
                $map: {
                    input: { $split: ["$artists_raw", ";"] },
                    as: "artist",
                    in: { $trim: { input: "$$artist" } }
                }
            }
        }
    },

    // 4. Формування аудіо-характеристик та обчислюваних полів
    // Створіть вкладений об’єкт audio_features, що включає всі аудіофічі: 
    // danceability, energy, loudness, speechiness, acousticness, instrumentalness, liveness, valence, tempo, key, mode, time_signature.
    // Додайте поле duration_sec — тривалість треку в секундах (округлена до одного знака).
    // Додайте поле popularity_tier: high — популярність ≥ 70, medium — популярність ≥ 40 і < 70, low — популярність < 40
    {
        $addFields: {
            audio_features: {
                danceability: "$danceability",
                energy: "$energy",
                loudness: "$loudness",
                speechiness: "$speechiness",
                acousticness: "$acousticness",
                instrumentalness: "$instrumentalness",
                liveness: "$liveness",
                valence: "$valence",
                tempo: "$tempo",
                key: "$key",
                mode: "$mode",
                time_signature: "$time_signature"
            },
            duration_sec: {
                $round: [{ $divide: ["$duration_ms", 1000] }, 1]
            },
            popularity_tier: {
                $switch: {
                    branches: [
                        { case: { $gte: ["$popularity", 70] }, then: "high" },
                        { case: { $gte: ["$popularity", 40] }, then: "medium" }
                    ],
                    default: "low"
                }
            }
        }
    },

    // 5. Очищення зайвих полів
    // Приберіть вихідні аудіофічі та поле artists_raw.
    {
        $unset: [
            "artists_raw",
            "danceability", "energy", "loudness", "speechiness", 
            "acousticness", "instrumentalness", "liveness", 
            "valence", "tempo", "key", "mode", "time_signature"
        ]
    },

    // 6. Збереження результату
    // Збережіть перетворені документи в колекцію tracks
    {
        $out: TARGET_COLLECTION
    }
]);

// 7. Перевірка результату
// Виведіть кількість документів у tracks.
// Виведіть один приклад документа для перевірки структури.
print("Кількість документів:");
print(db[TARGET_COLLECTION].countDocuments({}));

print("\nПриклад документа:");
printjson(db[TARGET_COLLECTION].findOne());