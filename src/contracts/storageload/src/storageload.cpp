#include <eosio/eosio.hpp>
#include <vector>

using namespace eosio;

const long MAX_RECORDS = 1000L;

CONTRACT storageload : public contract {
  private:
  
      struct [[eosio::table]] vector_struct {
          long id;
          std::vector<double> vector;
          uint64_t primary_key() const { return id;}
      };
      
      typedef eosio::multi_index< "vectors"_n, vector_struct> vectors_table_t;
      
  public:
      using contract::contract;

      ACTION write(long size, std::string unique) {
          
          vectors_table_t vectors_table(get_self(), get_first_receiver().value);
          
          std::vector<double> data;
          
          for (long i = 0; i < size; i++) {
              data.push_back(1.0 * i);
          }
          
          auto iterator = vectors_table.begin();
          if(iterator == vectors_table.end()) {
              vectors_table.emplace(get_self(), [&]( auto& v ) {
                  v.vector = data;
                  v.id = 0;
              });
          } else {
            vectors_table.modify(iterator, get_self(), [&]( auto& v ) {
                  v.vector = data;
                  v.id = 0;
              });
          }
          
          printf("Written vector of %d doubles, unique: %s.", size, unique.c_str());
      }
};