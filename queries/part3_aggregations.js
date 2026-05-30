/*
Завдання 1. Топ-10 виконавців за середньою популярністю
Знайдіть виконавців, у яких є хоча б 5 треків. Для кожного виконавця порахуйте середню популярність його треків. 
Потім відсортуйте за спаданням та виберіть топ-10 виконавців. Вивід повинен включати ім’я виконавця та його середню популярність.
*/

db.tracks.aggregate([
    { 
        $unwind: "$artists" 
    },
    {
        $group: {
            _id: "$artists",
            total_tracks: { $sum: 1 },
            avg_popularity: { $avg: "$popularity" }
        }
    },

    {
        $match: {
            total_tracks: { $gte: 5 }
        }
    },
    {
        $sort: {
            avg_popularity: -1
        }
    },
    {
        $limit: 10
    },
    {
        $project: {
            _id: 0,
            artist_name: "$_id",
            avg_popularity: { $round: ["$avg_popularity", 1] }
        }
    }
])

/*
Завдання 2. Розподіл треків за настроєм
Кожному треку присвойте настрій на основі двох полів: valence (позитивність) та energy:
високий valence + висока energy → happy
низький valence + висока energy → angry
високий valence + низька energy → calm
низький valence + низька energy → sad 
Порахуйте, скільки треків потрапило до кожної категорії, та виведіть таблицю з настроєм і кількістю треків.
*/

db.tracks.aggregate([
  {
    $project: {
      mood: {
        $cond: [
          {
            $gte: ["$audio_features.valence", 0.5]
          },
          {
            $cond: [
              {
                $gte: ["$audio_features.energy", 0.5
                ]
              },
              "happy",
              "calm"
            ]
          },
          {
            $cond: [
              {
                $gte: ["$audio_features.energy", 0.5]
              },
              "angry",
              "sad"
            ]
          }
        ]
      }
    }
  },
  {
    $group: {
      _id: "$mood",
      track_count: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      mood: "$_id",
      track_count: 1
    }
  }
]);

/*
Завдання 3. Найбільш «танцювальний» жанр
Визначте, який музичний жанр найкраще підходить для танців. Для цього згрупуйте треки за жанрами та обчисліть середні значення танцювальності (danceability), енергії (energy) та позитивності (valence).
Відфільтруйте жанри, в яких налічується менше 100 треків, щоб забезпечити статистичну надійність. У результаті виведіть:
назву жанру
середню танцювальність (avg_danceability)
середню енергію (avg_energy)
середню позитивність (avg_valence)
кількість треків у жанрі
*/
ddb.tracks.aggregate([
  {
    $group: {
      _id: "$track_genre",
      track_count: { $sum: 1 },
      avg_danceability: { $avg: "$audio_features.danceability" },
      avg_energy: { $avg: "$audio_features.energy" },
      avg_valence: { $avg: "$audio_features.valence" }
    }
  },
  {
    $match: {
      track_count: { $gte: 100 }
    }
  },
  {
    $sort: {
      avg_danceability: -1
    }
  },
  {
    $limit: 1
  },
  {
    $project: {
      _id: 0,
      genre: "$_id",
      track_count: 1,
      avg_danceability: { $round: ["$avg_danceability", 3] },
      avg_energy: { $round: ["$avg_energy", 3] },
      avg_valence: { $round: ["$avg_valence", 3] }
    }
  }
]);